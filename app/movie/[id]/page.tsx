// app/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/media/HeroSection';
import MediaRow from '@/components/media/MediaRow';
import WatchlistRow from '@/components/media/WatchlistRow';
import LikedRow from '@/components/media/LikedRow';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const revalidate = 3600; // 1 hour ISR

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY; // server-only key
const SKIP_SSG_FETCH = String(process.env.SKIP_SSG_FETCH ?? '0') === '1'; // env toggle

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

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } finally {
    clearTimeout(id);
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

async function tmdbGet(path: string, params: Record<string, any> = {}, timeout = 7000) {
  if (!TMDB_API_KEY) throw new Error('Missing TMDB_API_KEY');
  const url = buildTmdbUrl(path, params);
  const res = await fetchWithTimeout(url, { headers: { Accept: 'application/json' }, next: { revalidate } }, timeout);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err: any = new Error(`TMDB ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

async function getHomePageData() {
  // If the build environment has SKIP_SSG_FETCH=1 we return demo content immediately.
  if (SKIP_SSG_FETCH) {
    return {
      trending: mockMovies,
      popular: mockMovies,
      topRated: mockMovies,
      latest: mockMovies,
      popularTV: [],
      topRatedTV: [],
      genres: [],
      isDemo: true,
      error: 'Build-time: skipped remote fetch (SKIP_SSG_FETCH=1)',
    };
  }

  // Otherwise perform direct server TMDB fetches (kept compact to avoid timeouts)
  try {
    const today = new Date().toISOString().split('T')[0];

    const results = await Promise.allSettled([
      tmdbGet('/trending/movie/week'),
      tmdbGet('/movie/popular', { page: 1 }),
      tmdbGet('/movie/top_rated', { page: 1 }),
      tmdbGet('/discover/movie', { sort_by: 'release_date.desc', 'vote_count.gte': 10, 'release_date.lte': today, page: 1 }),
      tmdbGet('/tv/popular', { page: 1 }),
      tmdbGet('/tv/top_rated', { page: 1 }),
      tmdbGet('/genre/movie/list'),
    ]);

    const safe = <T,>(p: PromiseSettledResult<T>, fallback: T) => (p.status === 'fulfilled' ? p.value : fallback);

    const trending = (safe(results[0], { results: [] } as any).results ?? []).slice(0, 20);
    const popular = safe(results[1], { results: [] } as any).results ?? [];
    const topRated = safe(results[2], { results: [] } as any).results ?? [];
    const latest = safe(results[3], { results: [] } as any).results ?? [];
    const popularTV = safe(results[4], { results: [] } as any).results ?? [];
    const topRatedTV = safe(results[5], { results: [] } as any).results ?? [];
    const genres = (safe(results[6], { genres: [] } as any).genres) ?? [];

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
        error: 'No data returned from TMDB (empty results).',
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

