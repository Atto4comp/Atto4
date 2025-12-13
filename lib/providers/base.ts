// lib/providers/base.ts
import { makeProviders, makeStandardFetcher, makeSimpleProxyFetcher, targets } from '@p-stream/providers';

const PROXY_URL = process.env.NEXT_PUBLIC_PROXY_URL;

if (!PROXY_URL) {
  console.warn("⚠️ PROXY_URL is missing! Scraping will fail in the browser.");
}

export const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  proxiedFetcher: makeSimpleProxyFetcher(PROXY_URL || '', fetch),
  target: targets.BROWSER,
});
