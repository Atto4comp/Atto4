// lib/browser-proxy.ts
type BrowserProxyOptions = {
  url: string;
  timeout?: number;
  waitForSelector?: string;
};
type BrowserProxyResult = {
  html: string;
  status: number;
  error?: string;
};

const ENABLED = (process.env.NEXT_ENABLE_BROWSER_PROXY ?? '0') === '1';
const IS_NODE =
  typeof process !== 'undefined' &&
  !!(process.versions && process.versions.node) &&
  process.env.NEXT_RUNTIME !== 'edge';

let _fetchWithBrowser:
  | ((args: BrowserProxyOptions) => Promise<BrowserProxyResult>)
  | null = null;

/**
 * Safe wrapper for routes. Returns { status: 501 } when disabled/not available.
 */
export async function fetchWithBrowserSafe(
  args: BrowserProxyOptions
): Promise<BrowserProxyResult> {
  if (!ENABLED || !IS_NODE) {
    return {
      html: '',
      status: 501,
      error: !ENABLED
        ? 'Browser proxy disabled (set NEXT_ENABLE_BROWSER_PROXY=1 to enable)'
        : 'Browser proxy not available on Edge runtime',
    };
  }

  if (!_fetchWithBrowser) {
    // Dynamically import the Node-only runtime impl
    const mod = await import('./browser-proxy-runtime');
    _fetchWithBrowser = mod.fetchWithBrowser;
  }

  return _fetchWithBrowser(args);
}
