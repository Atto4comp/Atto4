// lib/browser-proxy.ts
let _fetchWithBrowser: null | (args: { url: string; timeout?: number; waitForSelector?: string }) => Promise<{ html: string; status: number; error?: string }> = null;

export async function fetchWithBrowserSafe(args: { url: string; timeout?: number; waitForSelector?: string }) {
  // Only attempt when explicitly enabled (and not on Edge runtime)
  if (!process.env.USE_BROWSER_PROXY) {
    return { html: '', status: 501, error: 'Browser proxy disabled' };
  }
  try {
    if (!_fetchWithBrowser) {
      // Lazy import so builds don’t fail where Puppeteer isn’t supported
      const mod = await import('./browser-proxy-runtime');
      _fetchWithBrowser = mod.fetchWithBrowser;
    }
    return await _fetchWithBrowser!(args);
  } catch (e: any) {
    return { html: '', status: 500, error: e?.message || 'browser proxy failed' };
  }
}
