'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Loader2,
  Film,
  Tv,
  LayoutGrid,
  List as ListIcon,
  Star,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';

// --- API & Helpers ---
const TMDB_SEARCH_URL = 'https://api.themoviedb.org/3/search/multi';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const DIRECT_TIMEOUT = 7000;
const PROXY_TIMEOUT = 9000;

function tmdbPoster(path: string | null, size = 'w500') {
  if (!path) return '/placeholder-movie.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

function buildDirectUrl(q: string) {
  const apikey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  // If there's no public key present, return null (we won't try direct)
  if (!apikey) return null;
  return `${TMDB_SEARCH_URL}?${new URLSearchParams({
    api_key: apikey,
    query: q,
    include_adult: 'false',
    language: 'en-US',
  })}`;
}

/**
 * Fetch helper with timeout — returns Response or throws
 */
async function fetchWithTimeout(url: string, timeout: number, options: RequestInit = {}, signal?: AbortSignal) {
  const controller = new AbortController();
  const signals = [controller.signal];
  if (signal) {
    // If the caller provided a signal, forward its abort
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// --- Main Component ---
export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams?.get('q') ?? '';

  // State
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [warnDirect, setWarnDirect] = useState<string | null>(null);

  // Refs
  const lastQueryRef = useRef<string>('');
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestAbortRef = useRef<AbortController | null>(null);

  // Sync URL -> input
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // update URL without navigation
  function updateUrl(q: string) {
    const params = new URLSearchParams(window.location.search);
    if (q.trim()) params.set('q', q.trim());
    else params.delete('q');
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newUrl);
  }

  // Core search: tries proxy first, falls back to direct if allowed
  async function performSearch(q: string) {
    // cancel previous request
    if (requestAbortRef.current) {
      requestAbortRef.current.abort();
      requestAbortRef.current = null;
    }

    if (!q.trim()) {
      setResults([]);
      setError(null);
      lastQueryRef.current = '';
      setWarnDirect(null);
      return;
    }

    // avoid duplicate
    if (lastQueryRef.current === q) return;
    lastQueryRef.current = q;

    setLoading(true);
    setError(null);
    setWarnDirect(null);

    const abortController = new AbortController();
    requestAbortRef.current = abortController;

    // Build proxy url (server-side proxy route)
    const proxyUrl = `/api/tmdb/proxy/search/multi?${new URLSearchParams({
      query: q,
      include_adult: 'false',
      language: 'en-US',
    }).toString()}`;

    // Try proxy first
    try {
      const res = await fetchWithTimeout(proxyUrl, PROXY_TIMEOUT, { headers: { Accept: 'application/json' } }, abortController.signal);
      if (!res.ok) {
        // Treat as failure and attempt fallback (if allowed)
        throw new Error(`Proxy request failed (${res.status})`);
      }

      const data = await res.json();
      const filtered = (data.results ?? [])
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path))
        .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0));

      setResults(filtered);
      setError(null);
      setLoading(false);
      requestAbortRef.current = null;
      return;
    } catch (proxyErr) {
      // Proxy failed or timed out — we'll attempt direct only if public key exists
      console.warn('Proxy search failed, attempting direct fallback if allowed.', proxyErr);
    }

    // DIRECT fallback (only if public key is present)
    const directUrl = buildDirectUrl(q);
    if (!directUrl) {
      setError('Search currently unavailable (proxy failed, no public API key configured).');
      setResults([]);
      setLoading(false);
      requestAbortRef.current = null;
      return;
    }

    // inform user that we're using the client-side fallback
    setWarnDirect('Using client-side fallback (public API key). Consider fixing your server proxy to avoid exposing keys.');

    try {
      const res = await fetchWithTimeout(directUrl, DIRECT_TIMEOUT, { headers: { Accept: 'application/json' } }, abortController.signal);

      if (!res.ok) {
        throw new Error(`Direct fetch failed (${res.status})`);
      }

      const data = await res.json();
      const filtered = (data.results ?? [])
        .filter((item: any) => (item.media_type === 'movie' || item.media_type === 'tv') && (item.poster_path || item.backdrop_path))
        .sort((a: any, b: any) => (b.popularity ?? 0) - (a.popularity ?? 0));

      setResults(filtered);
      setError(null);
    } catch (directErr) {
      console.error('Direct fetch failed too', directErr);
      setError('Unable to fetch results. Please try again later.');
      setResults([]);
    } finally {
      setLoading(false);
      requestAbortRef.current = null;
    }
  }

  // Debounce + performSearch
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      updateUrl(query);
      performSearch(query);
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Abort pending request on unmount
  useEffect(() => {
    return () => {
      if (requestAbortRef.current) requestAbortRef.current.abort();
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  // Client-side Filter
  const displayedResults = results.filter((item) => (filter === 'all' ? true : item.media_type === filter));

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20 relative overflow-x-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-purple-900/10 blur-[150px] rounded-full opacity-60" />
        <div className="absolute bottom-[-20%] right-[20%] w-[60%] h-[60%] bg-blue-900/10 blur-[150px] rounded-full opacity-60" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8">
        {/* --- 1. Search Hero Section --- */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-chillax mb-6 tracking-tight">
            Find your next{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              obsession
            </span>
            .
          </h1>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur opacity-50 group-focus-within:opacity-100 transition duration-500" />
            <div className="relative flex items-center bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden shadow-2xl transition-all focus-within:border-white/30 focus-within:scale-[1.01]">
              <div className="pl-6 text-gray-400">
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search movies, TV shows, actors..."
                className="w-full bg-transparent border-none text-white placeholder-gray-500 px-4 py-5 text-lg focus:outline-none font-medium"
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery('')} className="pr-6 text-gray-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* --- 2. Controls & Filters --- */}
        {(!loading && results.length > 0) && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full backdrop-blur-sm border border-white/5">
              {(['all', 'movie', 'tv'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filter === f
                      ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f === 'all' ? 'All Results' : f === 'movie' ? 'Movies' : 'TV Shows'}
                </button>
              ))}
            </div>

            {/* View Toggle + count */}
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>{displayedResults.length} results</span>
              <div className="h-4 w-px bg-white/10 mx-2" />
              <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'hover:text-white'}`}
                  aria-label="List view"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning about using direct fallback */}
        {warnDirect && (
          <div className="text-sm text-yellow-300 mb-4">
            {warnDirect}
          </div>
        )}

        {/* --- 3. Results Area --- */}
        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 opacity-85">
            <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-lg text-red-300">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && results.length === 0 && query && (
          <div className="flex flex-col items-center justify-center py-32 opacity-50">
            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-white/30" />
            </div>
            <h2 className="text-2xl font-bold font-chillax">No results found</h2>
            <p className="text-gray-400 mt-2">We couldn't find anything matching "{query}"</p>
          </div>
        )}

        {/* Loading placeholder */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-white/5" />
            ))}
          </div>
        )}

        {/* Results - Adaptive Grid/List */}
        {!loading && !error && displayedResults.length > 0 && (
          <div
            className={`
            ${viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'
              : 'flex flex-col gap-4 max-w-5xl mx-auto'}
          `}
          >
            {displayedResults.map((item, idx) => {
              const isMovie = item.media_type === 'movie';
              const title = isMovie ? item.title : item.name;
              const date = isMovie ? item.release_date : item.first_air_date;
              const year = date ? new Date(date).getFullYear() : '—';
              const rating = item.vote_average?.toFixed(1);

              // Animation Stagger Delay
              const animStyle = { animationDelay: `${idx * 50}ms` };

              return (
                <Link
                  key={`${item.media_type}-${item.id}`}
                  href={`/${item.media_type}/${item.id}`}
                  className={`group relative animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards duration-500
                    ${viewMode === 'list'
                      ? 'flex gap-6 bg-[#111] hover:bg-[#161616] border border-white/5 p-4 rounded-2xl transition-colors'
                      : 'block'
                    }
                  `}
                  style={animStyle}
                >
                  {/* Poster */}
                  <div className={`relative overflow-hidden bg-gray-800 shadow-2xl
                    ${viewMode === 'list'
                        ? 'w-24 h-36 rounded-lg flex-shrink-0'
                        : 'aspect-[2/3] rounded-xl mb-3 group-hover:scale-[1.02] transition-transform duration-300'
                      }
                    `}
                  >
                    <Image
                      src={tmdbPoster(item.poster_path || item.backdrop_path)}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="300px"
                    />

                    {/* Badges (Grid Only) */}
                    {viewMode === 'grid' && rating > 0 && (
                      <div className="absolute bottom-3 left-3 text-yellow-400 text-xs font-bold flex items-center gap-1 bg-black/40 px-2 py-1 rounded">
                        <Star className="w-3 h-3 fill-current" /> {rating}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className={`${viewMode === 'list' ? 'flex flex-col justify-center flex-1' : 'px-1'}`}>
                    <h3 className={`font-bold text-white leading-tight group-hover:text-blue-400 transition-colors
                      ${viewMode === 'list' ? 'text-xl mb-2' : 'text-sm line-clamp-1'}
                    `}>
                      {title}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-400 font-medium mt-1">
                      <span className="flex items-center gap-1 uppercase tracking-wider">
                        {isMovie ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                        {isMovie ? 'Movie' : 'TV Show'}
                      </span>
                      <span className="w-1 h-1 bg-gray-600 rounded-full" />
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {year}
                      </span>
                      {viewMode === 'list' && rating > 0 && (
                        <>
                          <span className="w-1 h-1 bg-gray-600 rounded-full" />
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" /> {rating}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Overview (List View Only) */}
                    {viewMode === 'list' && (
                      <p className="text-sm text-gray-500 mt-3 line-clamp-2 leading-relaxed max-w-2xl">
                        {item.overview || 'No description available.'}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
