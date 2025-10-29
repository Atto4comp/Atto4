import { exec } from 'child_process';
import { promisify } from 'util';
import { query } from '@/lib/db/postgres';

const execAsync = promisify(exec);

export interface ProcessorResult {
  success: boolean;
  m3u8Url?: string;
  error?: string;
  metadata?: {
    variants?: Array<{ resolution: string; bandwidth: number; quality?: string }>;
    hasAudio?: boolean;
    hasSubtitles?: boolean;
    validatedAt: string;
  };
}

export interface CandidateEndpoint {
  type: 'url' | 'streamlink';
  url: string;
  quality?: string; // 'best', 'worst', '720p', '1080p', etc.
  metadata?: Record<string, any>;
}

export class M3U8Processor {
  static async processEndpoint(candidate: CandidateEndpoint): Promise<ProcessorResult> {
    try {
      if (candidate.type === 'url') {
        return await this.validateM3U8Url(candidate.url);
      }
      if (candidate.type === 'streamlink') {
        return await this.extractWithStreamlink(candidate.url, candidate.quality);
      }
      return { success: false, error: 'Unknown candidate type' };
    } catch (error: any) {
      console.error('Processor error:', error);
      return { success: false, error: error?.message || 'Processing failed' };
    }
  }

  private static async validateM3U8Url(url: string): Promise<ProcessorResult> {
    try {
      // HEAD first
      const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(10_000) });
      if (!head.ok) {
        return { success: false, error: `HTTP ${head.status}: ${head.statusText}` };
      }

      let valid = false;
      const ct = head.headers.get('content-type') || '';
      if (ct.includes('mpegurl') || ct.includes('m3u8')) {
        valid = true;
      } else {
        // Fallback to GET + magic header
        const getRes = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(10_000),
          headers: { Range: 'bytes=0-2000' },
        });
        const text = await getRes.text();
        valid = text.trim().startsWith('#EXTM3U');
        if (!valid) return { success: false, error: 'Not a valid M3U8 file' };
      }

      const metadata = await this.parseM3U8Metadata(url);
      return {
        success: valid,
        m3u8Url: valid ? url : undefined,
        metadata: {
          ...metadata,
          validatedAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Validation failed' };
    }
  }

  private static async extractWithStreamlink(
    sourceUrl: string,
    quality: string = 'best'
  ): Promise<ProcessorResult> {
    try {
      const cached = await this.getCachedStreamlink(sourceUrl, quality);
      if (cached) {
        return {
          success: true,
          m3u8Url: cached.extractedUrl,
          metadata: cached.metadata,
        };
      }

      // 1) Try direct stream URL
      const { stdout: streamUrl, stderr: urlErr } = await execAsync(
        `streamlink --stream-url "${sourceUrl}" ${quality}`,
        { timeout: 30_000, maxBuffer: 1024 * 1024 }
      );

      let extractedUrl = (streamUrl || '').trim();
      if (urlErr && !extractedUrl) {
        throw new Error(`Streamlink error: ${urlErr}`);
      }

      // 2) If not direct, enumerate streams via JSON
      let slMeta: any = {};
      if (!extractedUrl || !/^https?:\/\//i.test(extractedUrl)) {
        const { stdout: jsonData } = await execAsync(`streamlink --json "${sourceUrl}"`, {
          timeout: 30_000,
          maxBuffer: 1024 * 1024,
        });
        const streamsData = JSON.parse(jsonData);
        const qualities = Object.keys(streamsData.streams || {});
        if (!qualities.length) throw new Error('No streams available from Streamlink');

        const q =
          qualities.includes(quality) ? quality : qualities.includes('best') ? 'best' : qualities[0];

        const { stdout: finalUrl } = await execAsync(
          `streamlink --stream-url "${sourceUrl}" ${q}`,
          { timeout: 30_000, maxBuffer: 1024 * 1024 }
        );
        extractedUrl = finalUrl.trim();
        slMeta = this.parseStreamlinkMetadata(streamsData);
      } else {
        // Try to fetch metadata for variants
        try {
          const { stdout: jsonData } = await execAsync(`streamlink --json "${sourceUrl}"`, {
            timeout: 15_000,
            maxBuffer: 1024 * 1024,
          });
          slMeta = this.parseStreamlinkMetadata(JSON.parse(jsonData));
        } catch (e) {
          console.warn('Failed to fetch Streamlink metadata:', e);
        }
      }

      // Validate extracted m3u8
      const validation = await this.validateM3U8Url(extractedUrl);
      if (!validation.success) {
        throw new Error(`Extracted URL validation failed: ${validation.error}`);
      }

      const finalMetadata = { ...slMeta, ...validation.metadata };
      await this.cacheStreamlink(sourceUrl, extractedUrl, quality, finalMetadata);

      return { success: true, m3u8Url: extractedUrl, metadata: finalMetadata };
    } catch (error: any) {
      console.error('❌ Streamlink extraction failed:', error);
      return { success: false, error: error?.message || 'Streamlink extraction failed' };
    }
  }

  private static parseStreamlinkMetadata(streamsData: any): any {
    const variants: Array<{ resolution: string; bandwidth: number; quality?: string }> = [];
    if (streamsData?.streams) {
      for (const [quality, stream] of Object.entries<any>(streamsData.streams)) {
        variants.push({
          quality,
          resolution: stream?.resolution || 'unknown',
          bandwidth: stream?.bandwidth || 0,
        });
      }
    }
    return {
      variants: variants.length ? variants : undefined,
      hasAudio: streamsData?.metadata?.audio ?? true,
      hasSubtitles: streamsData?.metadata?.subtitles ?? false,
    };
  }

  private static async parseM3U8Metadata(url: string): Promise<any> {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      const text = await res.text();

      const variants: Array<{ resolution: string; bandwidth: number }> = [];
      let hasAudio = false;
      let hasSubtitles = false;

      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXT-X-STREAM-INF:')) {
          const resMatch = line.match(/RESOLUTION=(\d+x\d+)/);
          const bwMatch = line.match(/BANDWIDTH=(\d+)/);
          if (resMatch && bwMatch) {
            variants.push({
              resolution: resMatch[1],
              bandwidth: parseInt(bwMatch[1], 10),
            });
          }
        }
        if (line.includes('TYPE=AUDIO')) hasAudio = true;
        if (line.includes('TYPE=SUBTITLES')) hasSubtitles = true;
      }

      return {
        variants: variants.length ? variants : undefined,
        hasAudio,
        hasSubtitles,
      };
    } catch (error) {
      console.error('Failed to parse M3U8 metadata:', error);
      return {};
    }
  }

  private static async cacheStreamlink(
    sourceUrl: string,
    extractedUrl: string,
    quality: string,
    metadata?: any
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    await query(
      `INSERT INTO streamlink_cache (source_url, extracted_url, quality, metadata, expires_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (source_url)
       DO UPDATE SET
         extracted_url = EXCLUDED.extracted_url,
         quality = EXCLUDED.quality,
         metadata = EXCLUDED.metadata,
         expires_at = EXCLUDED.expires_at,
         created_at = CURRENT_TIMESTAMP`,
      [sourceUrl, extractedUrl, quality, JSON.stringify(metadata || {}), expiresAt]
    );
  }

  private static async getCachedStreamlink(sourceUrl: string, quality: string): Promise<any> {
    const result = await query(
      `SELECT * FROM streamlink_cache
       WHERE source_url = $1 AND quality = $2 AND expires_at > CURRENT_TIMESTAMP`,
      [sourceUrl, quality]
    );
    return result.rows[0] || null;
  }

  static async cleanExpiredCache(): Promise<void> {
    await query(`DELETE FROM streamlink_cache WHERE expires_at < CURRENT_TIMESTAMP`);
  }

  static async isStreamlinkInstalled(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('streamlink --version', { timeout: 5000 });
      return stdout.toLowerCase().includes('streamlink');
    } catch {
      return false;
    }
  }

  static async getAvailableStreams(url: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`streamlink --json "${url}"`, {
        timeout: 30_000,
        maxBuffer: 1024 * 1024,
      });
      const data = JSON.parse(stdout);
      return Object.keys(data.streams || {});
    } catch (error: any) {
      console.error('Failed to get available streams:', error);
      return [];
    }
  }
}
