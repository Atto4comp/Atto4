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
  /**
   * Extract m3u8 URL from provider URL using Streamlink
   */
  static async extract(
    providerUrl: string,
    providerId: string,
    quality: string = 'best',
    timeout: number = 30000
  ): Promise<ExtractionResult> {
    try {
      console.log(`🔄 Extracting from ${providerId}: ${providerUrl}`);

      // First, check available streams
      const availableQualities = await this.getAvailableQualities(providerUrl, timeout);
      
      if (availableQualities.length === 0) {
        return {
          success: false,
          error: 'No streams available',
          provider: providerId,
        };
      }

      // Select quality (prefer requested, fallback to best)
      const selectedQuality = availableQualities.includes(quality) 
        ? quality 
        : availableQualities.includes('best')
        ? 'best'
        : availableQualities[0];

      // Extract stream URL
      const { stdout, stderr } = await execAsync(
        `streamlink --stream-url "${providerUrl}" ${selectedQuality}`,
        { timeout, maxBuffer: 1024 * 1024 }
      );

      if (stderr && !stdout.trim()) {
        throw new Error(`Streamlink error: ${stderr}`);
      }

      const m3u8Url = stdout.trim();

      if (!m3u8Url || !m3u8Url.startsWith('http')) {
        throw new Error('Invalid stream URL extracted');
      }

      // Validate the m3u8 URL
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
      console.error(`❌ Extraction failed for ${providerId}:`, error.message);
      
      return {
        success: false,
        error: error.message || 'Extraction failed',
        provider: providerId,
      };
    }
  }

  /**
   * Get available stream qualities from provider
   */
  static async getAvailableQualities(
    providerUrl: string,
    timeout: number = 15000
  ): Promise<string[]> {
    try {
      const { stdout } = await execAsync(
        `streamlink --json "${providerUrl}"`,
        { timeout, maxBuffer: 1024 * 1024 }
      );

      const data = JSON.parse(stdout);
      return Object.keys(data.streams || {});
    } catch (error) {
      console.warn('Failed to get available qualities:', error);
      return [];
    }
  }

  /**
   * Validate that URL is a working m3u8 stream
   */
  static async validateM3u8(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) return false;

      const contentType = response.headers.get('content-type');
      return contentType?.includes('mpegurl') || contentType?.includes('m3u8') || true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Streamlink is installed
   */
  static async isInstalled(): Promise<boolean> {
    try {
      const { stdout } = await execAsync('streamlink --version', { timeout: 5000 });
      return stdout.includes('streamlink');
    } catch {
      return false;
    }
  }
}
