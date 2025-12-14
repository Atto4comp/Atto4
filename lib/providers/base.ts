import {
  makeProviders,
  makeStandardFetcher,
  makeSimpleProxyFetcher,
  targets,
} from '@p-stream/providers';

const PROXY = process.env.NEXT_PUBLIC_PROXY_URL!;

export const providers = makeProviders({
  fetcher: makeStandardFetcher(fetch),
  proxiedFetcher: makeSimpleProxyFetcher(PROXY, fetch),
  target: targets.BROWSER,
});
