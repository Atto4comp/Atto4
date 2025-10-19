// lib/browser-proxy.ts

// ✅ Imports MUST be at the very top in ESM/TypeScript files.
// (We only import types here; puppeteer is loaded dynamically.)
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

// ---- Runtime feature flags --------------------------------------------------

const ENABLED =
  (process.env.NEXT_ENABLE_BROWSER_PROXY ?? '0') === '1'; // opt-in only

const IS_NODE =
  typeof process !== 'undefined' &&
  !!(process.versions && process.versions.node) &&
  // Vercel Edge sets this env; guard against it
  process.env.NEXT_RUNTIME !== 'edge';

// ---- Lazy holder for the real browser fetch impl ----------------------------

let _fetchWithBrowser:
  | ((
      args: BrowserProxyOptions
    ) => Promise<BrowserProxyResult>)
  | null = null;

// ---- Public safe API (use this everywhere) ----------------------------------

/**
 * Safe wrapper. Returns {status: 501} when disabled or not in Node runtime.
 * When enabled, dynamically loads puppeteer + stealth and fetches the page.
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
        : 'Browser proxy not available on this runtime (Edge). Use nodejs runtime.',
    };
  }

  // Initialize the real implementation once
  if (!_fetchWithBrowser) {
    _fetchWithBrowser = await makeFetchWithBrowser();
  }

  return _fetchWithBrowser(args);
}

// ---- Internal: build the real implementation lazily -------------------------

let browserInstance: any = null;

async function makeFetchWithBrowser() {
  // Dynamic imports so the module can be bundled even if puppeteer isn’t installed/enabled
  const puppeteerExtra = await import('puppeteer-extra');
  const stealthPlugin = (await import('puppeteer-extra-plugin-stealth')).default;

  const puppeteer = puppeteerExtra.default;
  puppeteer.use(stealthPlugin());

  async function getBrowser() {
    if (!browserInstance) {
      browserInstance = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });
    }
    return browserInstance;
  }

  // The actual fetcher used by fetchWithBrowserSafe
  return async function fetchWithBrowser({
    url,
    timeout = 30000,
    waitForSelector = 'body',
  }: BrowserProxyOptions): Promise<BrowserProxyResult> {
    let page: any = null;
    try {
      const browser = await getBrowser();
      page = await browser.newPage();

      // Realistic viewport + UA
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      );

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      });

      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout,
      });

      if (waitForSelector) {
        await page
          .waitForSelector(waitForSelector, { timeout: 5000 })
          .catch(() => {});
      }

      const html = await page.content();
      const status = response?.status() || 200;

      return { html, status };
    } catch (error: any) {
      return { html: '', status: 500, error: error?.message ?? 'unknown' };
    } finally {
      if (page) {
        try {
          await page.close();
        } catch {}
      }
    }
  };
}

// ---- Cleanup on process exit ------------------------------------------------

if (IS_NODE) {
  // Avoid “process is not defined” on Edge
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('exit', async () => {
    try {
      if (browserInstance) await browserInstance.close();
    } catch {}
  });
}
