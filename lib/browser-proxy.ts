import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

interface BrowserProxyOptions {
  url: string;
  timeout?: number;
  waitForSelector?: string;
}

interface BrowserProxyResult {
  html: string;
  status: number;
  error?: string;
}

// Browser instance cache (reuse for performance)
let browserInstance: any = null;

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

export async function fetchWithBrowser({
  url,
  timeout = 30000,
  waitForSelector = 'body',
}: BrowserProxyOptions): Promise<BrowserProxyResult> {
  let page: any = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Set realistic viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );

    // Set extra headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    });

    console.log(`🌐 Fetching with browser: ${url}`);

    // Navigate to the URL
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Wait for specific selector if provided
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 5000 }).catch(() => {
        console.warn('Selector not found, continuing anyway');
      });
    }

    // Get the final HTML content
    const html = await page.content();
    const status = response?.status() || 200;

    console.log(`✅ Browser fetch success: ${status}`);

    return {
      html,
      status,
    };
  } catch (error: any) {
    console.error('❌ Browser fetch error:', error.message);
    return {
      html: '',
      status: 500,
      error: error.message,
    };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

// Cleanup on process exit
process.on('exit', async () => {
  if (browserInstance) {
    await browserInstance.close();
  }
});
