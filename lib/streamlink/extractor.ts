// lib/streamlink/extractor.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Optional remote microservice URL (e.g. http://localhost:8000)
const STREAMLINK_API = (process.env.STREAMLINK_API_URL || '').replace(/\/+$/, ''); // trim trailing slash

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
   * Extract m3u8 URL from provider URL using either:
   *  1) Remote microservice (if STREAMLINK_API_URL is set)
   *  2) Local streamlink CLI (fallback or if no API)
   */
  static async extract(
    providerUrl: string,
    providerId: string,
    quality: string = 'best',
    timeout: number = 30_000
  ): Promise<ExtractionResult> {
    // 1) Try remote API first if configured
    if (STREAMLINK_API) {
      try {
        const remote = await this.extractViaAPI(providerUrl, quality, timeout);
        return {
          success: true,
          m3u8Url: remote.m3u8Url,
          quality: remote.quality,
          availableQualities: remote.availableQualities,
          provider: providerId,
        };
      } catch (e: any) {
        console.warn(`[extract] Remote extractor failed, falling back to local:`, e?.message || e);
        // fall through to local CLI as a safety net
      }
    }

    // 2) Local CLI path
    try {
      console.log(`🔄 Extracting from ${providerId}: ${providerUrl}`);

      const availableQualities = await this.getAvailableQualities(providerUrl, timeout);
      if (availableQualities.length === 0) {
        return { success: false, error: 'No streams available', provider: providerId };
      }

      const selectedQuality = pickQuality(availableQualities, quality);

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
      if (!isValid) throw new Error('Extracted URL is not a valid m3u8 stream');

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

  /**
   * Try to enumerate available qualities.
   * If a remote API is configured, we ping it once and read its returned list.
   * Otherwise, use local `streamlink --json`.
   */
  static async getAvailableQualities(
    providerUrl: string,
    timeout: number = 15_000
  ): Promise<string[]> {
    // Prefer remote if available, as it already resolves plugin logic
    if (STREAMLINK_API) {
      try {
        const res = await this.extractViaAPI(providerUrl, 'best', timeout);
        return Array.isArray(res.availableQualities) ? res.availableQualities : [];
      } catch (e) {
        console.warn('[getAvailableQualities] Remote call failed, trying local:', (e as any)?.message);
        // fall through to local
      }
    }

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

  /**
   * Validate that URL is a working m3u8 stream.
   */
  static async validateM3u8(url: string): Promise<boolean> {
    try {
      const head = await timedFetch(url, { method: 'HEAD' }, 5000);
      if (!head.ok) return false;
      const ct = head.headers.get('content-type') || '';
      if (ct.includes('mpegurl') || ct.includes('m3u8')) return true;

      // fallback: small GET to detect #EXTM3U
      const get = await timedFetch(
        url,
        { method: 'GET', headers: { Range: 'bytes=0-2000' } },
        5000
      );
      const text = await get.text();
      return text.trim().startsWith('#EXTM3U');
    } catch {
      return false;
    }
  }

  /**
   * Is streamlink available?
   * Uses remote health if STREAMLINK_API_URL is set, otherwise checks local CLI.
   */
  static async isInstalled(): Promise<boolean> {
    if (STREAMLINK_API) {
      try {
        const res = await timedFetch(`${STREAMLINK_API}/health`, { method: 'GET' }, 5000);
        if (!res.ok) return false;
        const data = await res.json().catch(() => ({} as any));
        return !!data?.installed;
      } catch {
        return false;
      }
    }

    try {
      const { stdout } = await execAsync('streamlink --version', { timeout: 5000 });
      return stdout.toLowerCase().includes('streamlink');
    } catch {
      return false;
    }
  }

  /**
   * Call the remote microservice /extract endpoint
   */
  private static async extractViaAPI(
    providerUrl: string,
    quality: string,
    timeout: number
  ): Promise<{ m3u8Url: string; quality: string; availableQualities: string[] }> {
    if (!STREAMLINK_API) throw new Error('STREAMLINK_API_URL not configured');

    const res = await timedFetch(
      `${STREAMLINK_API}/extract`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: providerUrl, quality }),
        cache: 'no-store',
      },
      timeout
    );

    const data = await res.json().catch(() => ({} as any));
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || `Remote extractor error (HTTP ${res.status})`);
    }
    if (!data?.m3u8Url || typeof data.m3u8Url !== 'string') {
      throw new Error('Remote extractor did not return a valid m3u8Url');
    }

    return {
      m3u8Url: data.m3u8Url,
      quality: data.quality || quality,
      availableQualities: Array.isArray(data.availableQualities) ? data.availableQualities : [],
    };
  }
}

/* -------------------------- helpers -------------------------- */

function pickQuality(available: string[], requested: string): string {
  if (available.includes(requested)) return requested;
  if (available.includes('best')) return 'best';
  return available[0];
}

async function timedFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  ms: number = 10_000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}
