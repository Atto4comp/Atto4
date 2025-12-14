import {
  makeProviders,
  makeStandardFetcher,
  targets,
  Fetcher,
} from '@p-stream/providers';

const PROXY = process.env.NEXT_PUBLIC_PROXY_URL!;

// Custom proxied fetcher
const proxyFetcher: Fetcher = async (url, ops) => {
  const proxyUrl = new URL(PROXY);
  proxyUrl.searchParams.set('url', url);

  if (ops?.headers) {
    proxyUrl.searchParams.set(
      'headers',
      encodeURIComponent(JSON.stringify(ops.headers))
    );
  }

  const res = await fetch(proxyUrl.toString(), {
    method: 'GET',
  });

  return {
    body: await res.text(),
    finalUrl: res.url,
    headers: res.headers,
    statusCode: res.status,
  };
};

export const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  proxiedFetcher: proxyFetcher,
  target: targets.BROWSER,
});
