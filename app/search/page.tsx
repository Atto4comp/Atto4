'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, RefreshCw } from 'lucide-react';

/**
 * Client-side TMDB search page — robust and network-friendly
 *
 * Behavior:
 * 1. Try direct TMDB client fetch (recommended).
 * 2. If direct fetch fails due to network/CORS, automatically try /api/tmdb/search proxy (if present).
 * 3. Retries with small backoff for transient failures.
 * 4. Debounce user input, cancel in-flight requests on new input.
 * 5. Detect offline state and auto-retry when online.
 *
 * Note: Ensure NEXT_PUBLIC_TMDB_API_KEY is present in your Vercel/Env for client-side calls.
 */

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const DEFAULT_TIMEOUT = 8000; // ms
const MAX_RETRIES = 2;

function tmdbPosterUrl(path?: string | null, size = 'w500') {
  if (!path) return '/placeholder-movie.jpg';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${p}`;
}

function buildTmdbDirectUrl(query: string, page = 1) {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '';
  const params = new URLSearchParams({
    query,
    page: String(page),
    language: 'en-US',
    include_adult: 'false',
    api_key: apiKey,
  });
  return `${TMDB_SEARCH_URL}?${params.toString()}`;
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = DEFAULT_TIMEOUT, signal?: AbortSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  // If external signal provided, combine them — when either aborts, request cancels.
  const signalToUse = signal
    ? new AbortSignalProxy([signal, controller.signal])
    : controller.signal;

  try {
    const res = await fetch(url, { ...opts, signal: signalToUse });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/** small helper to combine multiple AbortSignals into one (works in-browser) */
function AbortSignalProxy(signals: AbortSignal[]) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signals.forEach((s) => {
    if (s.aborted) controller.abort();
    else s.addEventListener('abort', onAbort, { once: true });
  });
  return controller.signal;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptingProxy, setAttemptingProxy] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const lastQueryRef = useRef<string>('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // when URL query param changes externally, update local state
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Update URL when user types and presses Enter / clears — keep shallow routing to preserve SPA
  const updateUrlQuery = useCallback(
    (q: string) => {
      const search = new URLSearchParams(Array.from(window.location.searchEntries ? window.location.searchEntries() : new URLSearchParams(window.location.search)));
      if (q && q.trim()) search.set('q', q.trim());
      else search.delete('q');
      const newUrl = `${window.location.pathname}?${search.toString()}`;
      router.replace(newUrl);
    },
    [router]
  );

  // Core search function:
  // Tries direct TMDB fetch; if fails (network/CORS), tries local proxy /api/tmdb/search fallback.
  const performSearch = useCallback(
    async (q: string) => {
      if (!q || !q.trim()) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      // avoid duplicate requests for same query
      if (lastQueryRef.current === q) return;

      lastQueryRef.current = q;
      setLoading(true);
      setError(null);
      setAttemptingProxy(false);

      // abort previous
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      // Helper to parse response JSON safely
      async function parseJsonSafe(res: Response) {
        try {
          return await res.json();
        } catch {
          return null;
        }
      }

      // Try direct TMDB fetch with small retries
      let attempt = 0;
      let lastErr: any = null;
      while (attempt < MAX_RETRIES) {
        attempt += 1;
        try {
          const url = buildTmdbDirectUrl(q, 1);
          const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' } }, DEFAULT_TIMEOUT, signal);
          if (!res.ok) {
            // if 401/403 then break early (bad key)
            if (res.status === 401 || res.status === 403) {
              const body = await parseJsonSafe(res);
              throw new Error(`TMDB auth error: ${res.status} ${JSON.stringify(body)}`);
            }
            // for other non-ok responses try again (server error)
            const body = await parseJsonSafe(res);
            throw new Error(`TMDB response error: ${res.status} ${JSON.stringify(body)}`);
          }

          const data = await res.json();
          if (!mountedRef.current) return;
          // filter & sort same as earlier
          const filtered = (data?.results ?? [])
            .filter(
              (item: any) =>
                (item.media_type === 'movie' || item.media_type === 'tv') &&
                item.poster_path &&
                (item.popularity ?? 0) > 0
            )
            .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0));

          setResults(filtered);
          setLoading(false);
          setError(null);
          return;
        } catch (err: any) {
          lastErr = err;
          // If aborted or offline, stop retrying
          if (signal.aborted) {
            setLoading(false);
            return;
          }
          if (!isOnline) {
            setLoading(false);
            setError('You are offline. Connect and try again.');
            return;
          }

          // If this looks like a network/CORS failure (TypeError from fetch in browsers), break and try proxy fallback.
          const isNetworkFailure = err instanceof TypeError || /NetworkError|Failed to fetch|fetch failed/i.test(String(err?.message ?? ''));

          // If auth error, surface to user
          if (/auth|401|403/i.test(String(err?.message ?? ''))) {
            setLoading(false);
            setError('Search is unavailable due to API authentication. Check your API key.');
            return;
          }

          // if network failure, attempt proxy fallback
          if (isNetworkFailure) break;

          // otherwise try again with backoff
          if (attempt < MAX_RETRIES) {
            const wait = Math.pow(2, attempt - 1) * 250;
            // eslint-disable-next-line no-await-in-loop
            await new Promise((r) => setTimeout(r, wait));
            continue;
          }
        }
      }

      // If we reach here, direct fetch failed — attempt proxy fallback if available
      if (!mountedRef.current) return;
      setAttemptingProxy(true);

      try {
        // First, quick HEAD to see if proxy exists (avoids long timeouts)
        const proxyHead = await fetch(`/api/tmdb/search?q=${encodeURIComponent(q)}&head_check=1`, { method: 'HEAD' });
        if (proxyHead && proxyHead.ok) {
          // proxy seems available — call it
          const proxyRes = await fetchWithTimeout(`/api/tmdb/search?q=${encodeURIComponent(q)}`, { headers: { Accept: 'application/json' } }, DEFAULT_TIMEOUT * 1.2, signal);
          if (!proxyRes.ok) {
            const txt = await parseJsonSafe(proxyRes);
            throw new Error(`Proxy error ${proxyRes.status}: ${JSON.stringify(txt)}`);
          }
          const data = await proxyRes.json();
          const filtered = (data?.results ?? [])
            .filter(
              (item: any) =>
                (item.media_type === 'movie' || item.media_type === 'tv') &&
                item.poster_path &&
                (item.popularity ?? 0) > 0
            )
            .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0));
          if (!mountedRef.current) return;
          setResults(filtered);
          setLoading(false);
          setError(null);
          setAttemptingProxy(false);
          return;
        }
      } catch (proxyErr) {
        // Proxy didn't work or not present
        // continue to final error handler below
      }

      // Final failure
      if (!mountedRef.current) return;
      setLoading(false);
      setAttemptingProxy(false);
      const userMsg = !isOnline ? 'You are offline. Connect and try again.' : 'Failed to load results. Please try again.';
      setError(userMsg);
      setResults([]);
    },
    [isOnline]
  );

  // Debounced input handler
  useEffect(() => {
    // If query empty, clear states
    if (!query || !query.trim()) {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      abortControllerRef.current?.abort();
      setResults([]);
      setError(null);
      setLoading(false);
      lastQueryRef.current = '';
      // update URL to reflect empty query
      updateUrlQuery('');
      return;
    }

    // update URL shallowly
    updateUrlQuery(query);

    // Debounce
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      performSearch(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      // do not abort here — allow the performSearch to manage abort on new calls
    };
  }, [query, performSearch]);

  // Manual retry (tries performSearch again)
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    performSearch(query.trim());
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Search Results</h1>
          <div className="flex gap-2 items-center">
            <p className="text-gray-400">
              Results for "{query}" {!loading && results.length > 0 && `(${results.length})`}
            </p>
            {!isOnline && <p className="text-sm text-yellow-400">You are offline</p>}
            {attemptingProxy && <p className="text-sm text-blue-300">Using fallback proxy...</p>}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">Searching...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-3">{error}</p>
              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900/60 hover:bg-gray-900/80 rounded"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
                <button
                  onClick={() => {
                    // open network diagnostics: try to open TMDB in new tab
                    window.open('https://api.themoviedb.org/3/configuration?api_key=' + encodeURIComponent(String(process.env.NEXT_PUBLIC_TMDB_API_KEY ?? '')), '_blank');
                  }}
                  className="text-sm underline text-gray-400"
                >
                  Check connectivity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No results found */}
        {!loading && !error && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-12">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No results found</h2>
            <p className="text-gray-400 text-center max-w-md">
              We couldn&apos;t find any movies or TV shows matching &quot;{query}&quot;. Try different search terms.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((item) => {
              const isMovie = item.media_type === 'movie';
              const title = isMovie ? item.title : item.name;
              const releaseDate = isMovie ? item.release_date : item.first_air_date;
              const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
              const posterUrl = tmdbPosterUrl(item.poster_path, 'w500');

              return (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={`/${item.media_type}/${item.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 transition-transform duration-200 group-hover:scale-105">
                    <Image
                      src={posterUrl}
                      alt={title || 'Movie/TV Show Poster'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 200px"
                      priority={false}
                    />

                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-medium">
                        ⭐ {Number(item.vote_average).toFixed(1)}
                      </div>
                    )}

                    <div className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur-sm text-gray-300 px-2 py-1 rounded text-xs font-medium">
                      {isMovie ? 'Movie' : 'TV'}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-1">
                      {title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {year || 'Unknown'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Prompt when empty */}
        {!loading && !error && results.length === 0 && !query && (
          <div className="flex flex-col items-center justify-center py-20">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Start searching</h2>
            <p className="text-gray-400 text-center max-w-md">
              Use the search bar to find movies and TV shows.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
