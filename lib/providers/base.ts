// lib/providers/base.ts
import { makeProviders, makeStandardFetcher, targets, Fetcher } from '@p-stream/providers';

const PROXY_BASE = process.env.NEXT_PUBLIC_PROXY_URL; // e.g., "https://atto4-proxy.workers.dev"

// Custom Fetcher that FORCEFULLY formats the URL correctly for your Worker
const myProxyFetcher: Fetcher = async (url, ops) => {
  // Construct: https://proxy.dev/?url=ENCODED_TARGET_URL
  const targetUrl = new URL(PROXY_BASE || '');
  targetUrl.searchParams.set('url', url); // This adds ?url=... correctly

  // Copy headers from the scraper request to the proxy request
  const headers = new Headers(ops?.headers || {});
  
  // Make the actual fetch
  const res = await fetch(targetUrl.toString(), {
    method: ops?.method || 'GET',
    headers: headers,
    body: ops?.body,
  });

  return {
    body: await res.text(), // Parse based on Content-Type if needed, but text covers HTML
    finalUrl: res.url,
    headers: res.headers,
    statusCode: res.status,
  };
};

export const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  proxiedFetcher: myProxyFetcher, // <--- USE THIS CUSTOM ONE
  target: targets.BROWSER,
});
