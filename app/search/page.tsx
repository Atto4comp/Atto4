'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, RefreshCw } from 'lucide-react';

const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const DIRECT_TIMEOUT = 7000; // 7 seconds timeout for direct TMDB
const PROXY_TIMEOUT = 9000;

function tmdbPoster(path: string | null, size = 'w500') {
  if (!path) return '/placeholder-movie.jpg';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${p}`;
}

function buildDirectUrl(q: string) {
  const apikey = process.env.NEXT_PUBLIC_TMDB_API_KEY!;
  return `${TMDB_SEARCH_URL}?${new URLSearchParams({
    api_key: apikey,
    query: q,
    include_adult: 'false',
    language: 'en-US',
  })}`;
}

// timeout helper
function fetchWithTimeout(url: string, timeout: number, options: RequestInit = {}) {
  return new Promise<Response>((resolve, reject) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    fetch(url, { ...options, signal: controller.signal })
      .then((res) => {
        clearTimeout(id);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingProxy, setUsingProxy] = useState(false);

  const lastQueryRef = useRef<string>('');
  const debounceRef = useRef<number | null>(null);

  // update local state if URL changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // update URL
  function updateUrl(q: string) {
    const params = new URLSearchParams(window.location.search);
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    router.replace(`${window.location.pathname}?${params.toString()}`);
  }

  async function performSearch(q: string) {
    if (!q.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    if (lastQueryRef.current === q) return;
    lastQueryRef.current = q;

    setLoading(true);
    setError(null);
    setUsingProxy(false);

    // --------------- 1) DIRECT TMDB CALL ---------------
    try {
      const directUrl = buildDirectUrl(q);
      const res = await fetchWithTimeout(directUrl, DIRECT_TIMEOUT, {
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const data = await res.json();
        const filtered =
          (data.results ?? [])
            .filter(
              (item: any) =>
                (item.media_type === 'movie' || item.media_type === 'tv') &&
                item.poster_path,
            )
            .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0));

        setResults(filtered);
        setLoading(false);
        return;
      }
      throw new Error(`Direct TMDB returned ${res.status}`);
    } catch (err) {
      console.warn('Direct TMDB failed — falling back to proxy', err);
    }

    // --------------- 2) PROXY FALLBACK (UPSTASH + caching) ---------------
    try {
      setUsingProxy(true);
      const proxyUrl = `/api/tmdb/proxy/search/multi?${new URLSearchParams({
        query: q,
        language: 'en-US',
        include_adult: 'false',
      })}`;

      const proxyRes = await fetchWithTimeout(proxyUrl, PROXY_TIMEOUT);
      if (!proxyRes.ok) throw new Error(`Proxy returned ${proxyRes.status}`);

      const data = await proxyRes.json();
      const filtered =
        (data.results ?? [])
          .filter(
            (item: any) =>
              (item.media_type === 'movie' || item.media_type === 'tv') &&
              item.poster_path,
          )
          .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0));

      setResults(filtered);
      setLoading(false);
    } catch (err) {
      console.error('Proxy also failed', err);
      setLoading(false);
      setError('Could not load search results. Check your network and try again.');
      setResults([]);
    }
  }

  // debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = window.setTimeout(() => {
      updateUrl(query);
      performSearch(query);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Search Results</h1>

          <div className="flex gap-3 items-center text-gray-400">
            <p>
              Results for "{query}"{' '}
              {!loading && results.length > 0 && `(${results.length})`}
            </p>

            {usingProxy && (
              <span className="text-blue-400 text-sm">Proxy fallback active</span>
            )}
          </div>
        </div>

        {/* loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-400">Searching…</span>
          </div>
        )}

        {/* error */}
        {error && !loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-400 mb-3">{error}</p>
              <button
                onClick={() => performSearch(query)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900/60 hover:bg-gray-900/80 rounded"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* no results */}
        {!loading && !error && results.length === 0 && query && (
          <div className="flex flex-col items-center py-12">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">No Results Found</h2>
            <p className="text-gray-400 text-center max-w-md">
              No results for “{query}”. Try a different keyword.
            </p>
          </div>
        )}

        {/* grid */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((item) => {
              const isMovie = item.media_type === 'movie';
              const title = isMovie ? item.title : item.name;
              const date = isMovie ? item.release_date : item.first_air_date;
              const year = date ? new Date(date).getFullYear() : '—';

              const poster = tmdbPoster(item.poster_path);

              return (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={`/${item.media_type}/${item.id}`}
                  className="group"
                >
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 group-hover:scale-105 transition">
                    <Image
                      src={poster}
                      alt={title}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs">
                      {isMovie ? 'Movie' : 'TV'}
                    </div>

                    {item.vote_average > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                        ⭐ {item.vote_average.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
                    <p className="text-gray-400 text-xs">{year}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* empty screen */}
        {!loading && !error && results.length === 0 && !query && (
          <div className="flex flex-col items-center py-20">
            <Search className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-medium text-white">Start searching</h2>
            <p className="text-gray-400 text-center max-w-md">
              Use the search bar to find movies & TV shows.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
