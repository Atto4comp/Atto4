import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ExtractionResult {
  success: boolean;
  m3u8Url?: string;
  quality?: string;
  availableQualities?: string[];
  error?: string;
  provider: string;
}

export class StreamlinkExtractor {
  static async extract(
    providerUrl: string,
    providerId: string,
    quality: string = 'best',
    timeout: number = 30_000
  ): Promise<ExtractionResult> {
    try {
      console.log(`🔄 Extracting from ${providerId}: ${providerUrl}`);

      const availableQualities = await this.getAvailableQualities(providerUrl, timeout);
      if (availableQualities.length === 0) {
        return { success: false, error: 'No streams available', provider: providerId };
      }

      const selectedQuality = availableQualities.includes(quality)
        ? quality
        : availableQualities.includes('best')
        ? 'best'
        : availableQualities[0];

      const { stdout, stderr } = await execAsync(
        `streamlink --stream-url "${providerUrl}" ${selectedQuality}`,
        { timeout, maxBuffer: 1024 * 1024 }
      );

      if (stderr && !stdout.trim()) {
        throw new Error(`Streamlink error: ${stderr}`);
      }

      const m3u8Url = stdout.trim();
      if (!m3u8Url || !/^https?:\/\//i.test(m3u8Url)) {
        throw new Error('Invalid stream URL extracted');
      }

      const isValid = await this.validateM3u8(m3u8Url);
      if (!isValid) {
        throw new Error('Extracted URL is not a valid m3u8 stream');
      }

      console.log(`✅ Extraction successful: ${providerId} (${selectedQuality})`);

      return {
        success: true,
        m3u8Url,
        quality: selectedQuality,
        availableQualities,
        provider: providerId,
      };
    } catch (error: any) {
      console.error(`❌ Extraction failed for ${providerId}:`, error?.message || error);
      return {
        success: false,
        error: error?.message || 'Extraction failed',
        provider: providerId,
      };
    }
  }

  static async getAvailableQualities(
    providerUrl: string,
    timeout: number = 15_000
  ): Promise<string[]> {
    try {
      const { stdout } = await execAsync(`streamlink --json "${providerUrl}"`, {
        timeout,
        maxBuffer: 1024 * 1024,
      });
      const data = JSON.parse(stdout);
      return Object.keys(data.streams || {});
    } catch (error) {
      console.warn('Failed to get available qualities:', error);
      return [];
    }
  }

  static async validateM3u8(url: string): Promise<boolean> {
    try {
      const head = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
      if (!head.ok) return false;
      const ct = head.headers.get('content-type') || '';
      if (ct.includes('mpegurl') || ct.includes('m3u8')) return true;

      // Fallback: check small GET for #EXTM3U
      const get = await fetch(url, {
        method: 'GET',
        headers: { Range: 'bytes=0-2000' },
        signal: AbortSignal.timeout(5000),
      });
      const text = await get.text();
      return text.trim().startsWith('#EXTM3U');
    } catch {
      return false;
    }
  }

  static async isInstalled(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('streamlink --version', { timeout: 5000 });
      return stdout.toLowerCase().includes('streamlink');
    } catch {
      return false;
    }
  }
}
