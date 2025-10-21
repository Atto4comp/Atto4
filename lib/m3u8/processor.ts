import { exec } from 'child_process';
import { promisify } from 'util';
import { query } from '@/lib/db/postgres';

const execAsync = promisify(exec);

export interface ProcessorResult {
  success: boolean;
  m3u8Url?: string;
  error?: string;
  metadata?: {
    variants?: Array<{ resolution: string; bandwidth: number; quality: string }>;
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
  /**
   * Verify and process a candidate endpoint
   */
  static async processEndpoint(candidate: CandidateEndpoint): Promise<ProcessorResult> {
    try {
      if (candidate.type === 'url') {
        return await this.validateM3U8Url(candidate.url);
      } else if (candidate.type === 'streamlink') {
        return await this.extractWithStreamlink(candidate.url, candidate.quality);
      }

      return {
        success: false,
        error: 'Unknown candidate type',
      };
    } catch (error: any) {
      console.error('Processor error:', error);
      return {
        success: false,
        error: error.message || 'Processing failed',
      };
    }
  }

  /**
   * Validate an M3U8 URL
   */
  private static async validateM3U8Url(url: string): Promise<ProcessorResult> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD', 
        signal: AbortSignal.timeout(10000) 
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('mpegurl') && !contentType.includes('m3u8')) {
        const getResponse = await fetch(url, { signal: AbortSignal.timeout(10000) });
        const text = await getResponse.text();

        if (!text.startsWith('#EXTM3U')) {
          return {
            success: false,
            error: 'Not a valid M3U8 file',
          };
        }
      }

      const metadata = await this.parseM3U8Metadata(url);

      return {
        success: true,
        m3u8Url: url,
        metadata: {
          ...metadata,
          validatedAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Validation failed',
      };
    }
  }

  /**
   * Extract stream URL using Streamlink CLI
   */
  private static async extractWithStreamlink(
    sourceUrl: string,
    quality: string = 'best'
  ): Promise<ProcessorResult> {
    try {
      // Check cache first
      const cached = await this.getCachedStreamlink(sourceUrl, quality);
      if (cached) {
        console.log('✅ Using cached streamlink URL');
        return {
          success: true,
          m3u8Url: cached.extractedUrl,
          metadata: cached.metadata,
        };
      }

      console.log(`🔄 Extracting with Streamlink: ${sourceUrl} (quality: ${quality})`);

      // Method 1: Get stream URL directly
      const { stdout: streamUrl, stderr: urlError } = await execAsync(
        `streamlink --stream-url "${sourceUrl}" ${quality}`,
        { timeout: 30000, maxBuffer: 1024 * 1024 }
      );

      if (urlError && !streamUrl.trim()) {
        throw new Error(`Streamlink error: ${urlError}`);
      }

      const extractedUrl = streamUrl.trim();

      if (!extractedUrl || !extractedUrl.startsWith('http')) {
        // Try getting available streams as JSON
        const { stdout: jsonData } = await execAsync(
          `streamlink --json "${sourceUrl}"`,
          { timeout: 30000, maxBuffer: 1024 * 1024 }
        );

        const streamsData = JSON.parse(jsonData);
        
        if (!streamsData.streams || Object.keys(streamsData.streams).length === 0) {
          throw new Error('No streams available from Streamlink');
        }

        // Get the best available quality
        const availableQualities = Object.keys(streamsData.streams);
        const selectedQuality = availableQualities.includes(quality) 
          ? quality 
          : availableQualities.includes('best') 
          ? 'best' 
          : availableQualities[0];

        // Extract URL for selected quality
        const { stdout: finalUrl } = await execAsync(
          `streamlink --stream-url "${sourceUrl}" ${selectedQuality}`,
          { timeout: 30000, maxBuffer: 1024 * 1024 }
        );

        if (!finalUrl.trim()) {
          throw new Error('Failed to extract stream URL');
        }

        return await this.processStreamlinkResult(sourceUrl, finalUrl.trim(), streamsData, quality);
      }

      // Get available streams info
      let metadata: any = {};
      try {
        const { stdout: jsonData } = await execAsync(
          `streamlink --json "${sourceUrl}"`,
          { timeout: 15000, maxBuffer: 1024 * 1024 }
        );
        const streamsData = JSON.parse(jsonData);
        metadata = this.parseStreamlinkMetadata(streamsData);
      } catch (metaError) {
        console.warn('Failed to fetch Streamlink metadata:', metaError);
      }

      // Validate the extracted URL
      const validation = await this.validateM3U8Url(extractedUrl);

      if (!validation.success) {
        throw new Error(`Extracted URL validation failed: ${validation.error}`);
      }

      // Merge metadata
      const finalMetadata = {
        ...metadata,
        ...validation.metadata,
      };

      // Cache the result (expires in 4 hours)
      await this.cacheStreamlink(sourceUrl, extractedUrl, quality, finalMetadata);

      console.log('✅ Streamlink extraction successful');

      return {
        success: true,
        m3u8Url: extractedUrl,
        metadata: finalMetadata,
      };
    } catch (error: any) {
      console.error('❌ Streamlink extraction failed:', error);
      return {
        success: false,
        error: error.message || 'Streamlink extraction failed',
      };
    }
  }

  /**
   * Process Streamlink result and cache it
   */
  private static async processStreamlinkResult(
    sourceUrl: string,
    extractedUrl: string,
    streamsData: any,
    requestedQuality: string
  ): Promise<ProcessorResult> {
    const metadata = this.parseStreamlinkMetadata(streamsData);
    
    // Validate the extracted URL
    const validation = await this.validateM3U8Url(extractedUrl);

    if (!validation.success) {
      throw new Error(`Extracted URL validation failed: ${validation.error}`);
    }

    const finalMetadata = {
      ...metadata,
      ...validation.metadata,
    };

    // Cache the result
    await this.cacheStreamlink(sourceUrl, extractedUrl, requestedQuality, finalMetadata);

    return {
      success: true,
      m3u8Url: extractedUrl,
      metadata: finalMetadata,
    };
  }

  /**
   * Parse Streamlink JSON metadata
   */
  private static parseStreamlinkMetadata(streamsData: any): any {
    const variants: Array<{ resolution: string; bandwidth: number; quality: string }> = [];

    if (streamsData.streams) {
      Object.entries(streamsData.streams).forEach(([quality, stream]: [string, any]) => {
        variants.push({
          quality,
          resolution: stream.resolution || 'unknown',
          bandwidth: stream.bandwidth || 0,
        });
      });
    }

    return {
      variants: variants.length > 0 ? variants : undefined,
      hasAudio: streamsData.metadata?.audio ?? true,
      hasSubtitles: streamsData.metadata?.subtitles ?? false,
    };
  }

  /**
   * Parse M3U8 metadata (variants, audio, subtitles)
   */
  private static async parseM3U8Metadata(url: string): Promise<any> {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const text = await response.text();

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

        if (line.includes('TYPE=AUDIO')) {
          hasAudio = true;
        }

        if (line.includes('TYPE=SUBTITLES')) {
          hasSubtitles = true;
        }
      }

      return {
        variants: variants.length > 0 ? variants : undefined,
        hasAudio,
        hasSubtitles,
      };
    } catch (error) {
      console.error('Failed to parse M3U8 metadata:', error);
      return {};
    }
  }

  /**
   * Cache Streamlink extraction result
   */
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

  /**
   * Get cached Streamlink result
   */
  private static async getCachedStreamlink(sourceUrl: string, quality: string): Promise<any> {
    const result = await query(
      `SELECT * FROM streamlink_cache 
       WHERE source_url = $1 AND quality = $2 AND expires_at > CURRENT_TIMESTAMP`,
      [sourceUrl, quality]
    );

    return result.rows[0] || null;
  }

  /**
   * Clean expired cache entries
   */
  static async cleanExpiredCache(): Promise<void> {
    await query(`DELETE FROM streamlink_cache WHERE expires_at < CURRENT_TIMESTAMP`);
  }

  /**
   * Check if Streamlink is installed
   */
  static async isStreamlinkInstalled(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('streamlink --version', { timeout: 5000 });
      return stdout.includes('streamlink');
    } catch {
      return false;
    }
  }

  /**
   * Get available streams from a URL
   */
  static async getAvailableStreams(url: string): Promise<string[]> {
    try {
      const { stdout } = await execAsync(
        `streamlink --json "${url}"`,
        { timeout: 30000, maxBuffer: 1024 * 1024 }
      );

      const data = JSON.parse(stdout);
      return Object.keys(data.streams || {});
    } catch (error: any) {
      console.error('Failed to get available streams:', error);
      return [];
    }
  }
}
