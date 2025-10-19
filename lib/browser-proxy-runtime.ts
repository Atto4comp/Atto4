// lib/browser-proxy-runtime.ts
// Keep your original stealth implementation here (unchanged logic).
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

let browserInstance: any = null;
async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
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

export async function fetchWithBrowser({
  url,
  timeout = 30000,
  waitForSelector = 'body',
}: { url: string; timeout?: number; waitForSelector?: string }) {
  let page: any;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    });

    const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout });
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 5000 }).catch(() => {});
    }

    const html = await page.content();
    return { html, status: resp?.status() || 200 };
  } catch (e: any) {
    return { html: '', status: 500, error: e?.message || 'browser fetch error' };
  } finally {
    try { await page?.close(); } catch {}
  }
}

// optional cleanup
process.on('exit', async () => { try { await browserInstance?.close(); } catch {} });
