// app/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/media/HeroSection';
import MediaRow from '@/components/media/MediaRow';
import WatchlistRow from '@/components/media/WatchlistRow';
import LikedRow from '@/components/media/LikedRow';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const revalidate = 3600; // 1 hour ISR

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY; // server-only: required
const DEFAULT_TIMEOUT = 7000; // ms
const REQUEST_RETRIES = 2;

if (!TMDB_API_KEY) {
  // Fail early during dev/build so you notice environment misconfig
  // (we still recover at runtime with demo content, but build-time should have key).
  // eslint-disable-next-line no-console
  console.warn('Warning: TMDB_API_KEY is not set. Home page will show demo content.');
}

const mockMovies = [
  {
    id: 1,
    title: 'Demo Movie',
    overview: 'This is a fallback demo movie description.',
    poster_path: null,
    backdrop_path: null,
    release_date: '2025-01-01',
    vote_average: 8,
    vote_count: 1000,
    genre_ids: [28],
    popularity: 99,
    media_type: 'movie',
  },
];

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function buildTmdbUrl(path: string, params: Record<string, any> = {}) {
  const url = new URL(`${TMDB_BASE}${path}`);
  const sp = new URLSearchParams({ api_key: TMDB_API_KEY ?? '' });
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    sp.set(k, String(v));
  });
  url.search = sp.toString();
  return url.toString();
}

/** Retry wrapper for TMDB fetches */
async function tmdbGet(path: string, params: Record<string, any> = {}, timeout = DEFAULT_TIMEOUT, retries = REQUEST_RETRIES) {
  if (!TMDB_API_KEY) {
    throw new Error('Missing TMDB_API_KEY');
  }

  const url = buildTmdbUrl(path, params);

  let lastErr: any = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' }, next: { revalidate } }, timeout);
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        const err: any = new Error(`TMDB ${res.status} ${res.statusText}`);
        err.status = res.status;
        err.body = text;
        throw err;
      }
      return await res.json();
    } catch (err: any) {
      lastErr = err;
      // don't retry 4xx auth errors
      if (err?.status === 401 || err?.status === 403) break;
      // small backoff before next retry
      if (attempt < retries) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 200));
        continue;
      }
    }
  }
  throw lastErr;
}

async function getHomePageData() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // endpoints and params
    const endpoints = {
      trending: { path: '/trending/movie/week', params: {} },
      popular: { path: '/movie/popular', params: { page: 1 } },
      topRated: { path: '/movie/top_rated', params: { page: 1 } },
      latest: {
        path: '/discover/movie',
        params: {
          sort_by: 'release_date.desc',
          'vote_count.gte': 10,
          release_date_lte: today, // note: TMDB expects release_date.lte but we will encode correctly below
          page: 1,
        },
      },
      popularTV: { path: '/tv/popular', params: { page: 1 } },
      topRatedTV: { path: '/tv/top_rated', params: { page: 1 } },
      genres: { path: '/genre/movie/list', params: {} },
    };

    // Fire requests in parallel with Promise.allSettled
    const promises = await Promise.allSettled([
      tmdbGet(endpoints.trending.path, endpoints.trending.params),
      tmdbGet(endpoints.popular.path, endpoints.popular.params),
      tmdbGet(endpoints.topRated.path, endpoints.topRated.params),
      // for discover, use proper param names (TMDB expects release_date.lte)
      tmdbGet('/discover/movie', {
        sort_by: 'release_date.desc',
        'vote_count.gte': 10,
        'release_date.lte': today,
        page: 1,
      }),
      tmdbGet(endpoints.popularTV.path, endpoints.popularTV.params),
      tmdbGet(endpoints.topRatedTV.path, endpoints.topRatedTV.params),
      tmdbGet(endpoints.genres.path, endpoints.genres.params),
    ]);

    const safe = <T,>(p: PromiseSettledResult<T>, fallback: T) => (p.status === 'fulfilled' ? p.value : fallback);

    const trending = (safe(promises[0], { results: [] } as any).results ?? []).slice(0, 20);
    const popular = safe(promises[1], { results: [] } as any).results ?? [];
    const topRated = safe(promises[2], { results: [] } as any).results ?? [];
    const latest = safe(promises[3], { results: [] } as any).results ?? [];
    const popularTV = safe(promises[4], { results: [] } as any).results ?? [];
    const topRatedTV = safe(promises[5], { results: [] } as any).results ?? [];
    const genres = (safe(promises[6], { genres: [] } as any).genres) ?? [];

    const hasAny =
      (trending && trending.length > 0) ||
      (popular && popular.length > 0) ||
      (topRated && topRated.length > 0) ||
      (latest && latest.length > 0);

    if (!hasAny) {
      return {
        trending: mockMovies,
        popular: mockMovies,
        topRated: mockMovies,
        latest: mockMovies,
        popularTV: [],
        topRatedTV: [],
        genres: [],
        isDemo: true,
        error: 'No data returned from TMDB. Showing demo content.',
      };
    }

    return {
      trending,
      popular,
      topRated,
      latest,
      popularTV,
      topRatedTV,
      genres,
      isDemo: false,
      error: undefined,
    };
  } catch (err: any) {
    // graceful fallback: return demo content on error
    return {
      trending: mockMovies,
      popular: mockMovies,
      topRated: mockMovies,
      latest: mockMovies,
      popularTV: [],
      topRatedTV: [],
      genres: [],
      isDemo: true,
      error: err?.message ?? 'Unknown error fetching TMDB data',
    };
  }
}

export default async function HomePage() {
  const {
    trending,
    popular,
    topRated,
    latest,
    popularTV,
    topRatedTV,
    genres,
    isDemo,
    error,
  } = await getHomePageData();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {(isDemo || error) && (
        <div className="bg-yellow-500 text-black text-center py-3 text-sm font-medium">
          {error ? `API Error: ${error}` : 'Showing demo content — Check your TMDB API key or network.'}
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection media={(trending || []).slice(0, 5)} />
      </Suspense>

      <div className="relative z-10 pt-16 pb-20 bg-gradient-to-b from-black via-gray-900 to-black space-y-16">
        <MediaRow title="Trending Movies" items={trending} genres={genres} category="trending" mediaType="movie" priority />
        <MediaRow title="Popular Movies" items={popular} genres={genres} category="popular" mediaType="movie" />
        <MediaRow title="Top-Rated Movies" items={topRated} genres={genres} category="top-rated" mediaType="movie" />
        <MediaRow title="Latest Movies" items={latest} genres={genres} category="latest" mediaType="movie" />

        {popularTV.length > 0 && <MediaRow title="Popular TV Shows" items={popularTV} genres={genres} category="popular" mediaType="tv" />}
        {topRatedTV.length > 0 && <MediaRow title="Top-Rated TV Shows" items={topRatedTV} genres={genres} category="top-rated" mediaType="tv" />}

        <Suspense fallback={<div className="h-64" />}>
          <WatchlistRow />
        </Suspense>
        <Suspense fallback={<div className="h-64" />}>
          <LikedRow />
        </Suspense>
      </div>
    </main>
  );
}

