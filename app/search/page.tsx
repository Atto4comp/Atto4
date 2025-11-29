'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Loader2, RefreshCw, Star, Film, Tv } from 'lucide-react';

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
    <main className="min-h-screen bg-black text-white pt-24 pb-20 relative overflow-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8">

        {/* Search Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold font-chillax mb-4">
            Search Results
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-white/60 text-lg">
            {query ? (
              <p>
                Showing results for <span className="text-white font-semibold">"{query}"</span>
                {!loading && results.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-white/10 rounded-full text-xs font-bold text-white/80 border border-white/5">
                    {results.length}
                  </span>
                )}
              </p>
            ) : (
              <p>Type to search for movies and TV shows...</p>
            )}

            {usingProxy && (
              <span className="text-blue-400 text-xs bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                Proxy Active
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-6 h-6 text-blue-500/50" />
              </div>
            </div>
            <span className="mt-6 text-white/40 font-medium tracking-wide animate-pulse">
              Searching Global Database...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-center max-w-md">
              <p className="text-red-400 mb-4 font-medium">{error}</p>
              <button
                onClick={() => performSearch(query)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-all w-full font-semibold"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && query && (
          <div className="flex flex-col items-center py-24 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-white/20" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 font-chillax">No Results Found</h2>
            <p className="text-white/40 max-w-md">
              We couldn't find anything matching <span className="text-white/70">"{query}"</span>. 
              Try checking for typos or using different keywords.
            </p>
          </div>
        )}

        {/* Results Grid */}
        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {results.map((item) => {
              const isMovie = item.media_type === 'movie';
              const title = isMovie ? item.title : item.name;
              const date = isMovie ? item.release_date : item.first_air_date;
              const year = date ? new Date(date).getFullYear() : 'TBA';
              const poster = tmdbPoster(item.poster_path);

              return (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={`/${item.media_type}/${item.id}`}
                  className="group block"
                >
                  {/* Card Image Container */}
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/5 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] group-hover:border-white/20">
                    <Image
                      src={poster}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                    />

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <div className={`px-2 py-1 rounded-md backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase ${isMovie ? 'bg-blue-500/20 text-blue-200' : 'bg-purple-500/20 text-purple-200'}`}>
                        {isMovie ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        {isMovie ? 'Movie' : 'TV'}
                      </div>
                    </div>

                    {/* Rating Badge */}
                    {item.vote_average > 0 && (
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-[10px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="mt-4 px-1">
                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 font-medium">
                      <span>{year}</span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full" />
                      <span className="uppercase text-[10px] tracking-wide opacity-70">
                        {item.original_language}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty Start Screen */}
        {!loading && !error && results.length === 0 && !query && (
          <div className="flex flex-col items-center py-32 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
              <Search className="w-20 h-20 text-white/10 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 font-chillax">Ready to Explore?</h2>
            <p className="text-white/40 max-w-md text-lg">
              Search for your favorite movies, TV shows, or uncover hidden gems from our massive library.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
