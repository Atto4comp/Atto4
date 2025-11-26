// app/page.tsx
import { Suspense } from 'react';
import HeroSection from '@/components/media/HeroSection';
import MediaRow from '@/components/media/MediaRow';
import WatchlistRow from '@/components/media/WatchlistRow';
import LikedRow from '@/components/media/LikedRow';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const revalidate = 3600; // page ISR: 1 hour

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

/**
 * Helper: internal server-side fetch to the proxy route.
 * Uses Next's `next.revalidate` to keep server-side caching consistent with page ISR.
 */
async function proxyFetch(path: string) {
  const url = `${process.env.NEXT_PUBLIC_SITE_ORIGIN ?? ''}/api/tmdb/proxy${path}`;
  // If NEXT_PUBLIC_SITE_ORIGIN is not set (local dev), use relative fetch path which is valid in Next server runtime
  const fetchUrl = url.startsWith('http') ? url : `/api/tmdb/proxy${path}`;

  // Use the same revalidate as the page for consistency.
  const res = await fetch(fetchUrl, {
    headers: { Accept: 'application/json' },
    // In Next.js App Router, this instructs the fetch cache/ISR behavior
    next: { revalidate: revalidate },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const err: any = new Error('Proxy fetch failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }

  return res.json();
}

async function getHomePageData() {
  try {
    // Build paths for the proxy endpoints
    const today = new Date().toISOString().split('T')[0];

    const endpoints = {
      trending: '/trending/movie/week',
      popular: '/movie/popular?page=1',
      topRated: '/movie/top_rated?page=1',
      latest: `/discover/movie?sort_by=release_date.desc&vote_count.gte=10&release_date.lte=${encodeURIComponent(
        today
      )}&page=1`,
      popularTV: '/tv/popular?page=1',
      topRatedTV: '/tv/top_rated?page=1',
      genres: '/genre/movie/list',
    };

    const promises = await Promise.allSettled([
      proxyFetch(endpoints.trending),
      proxyFetch(endpoints.popular),
      proxyFetch(endpoints.topRated),
      proxyFetch(endpoints.latest),
      proxyFetch(endpoints.popularTV),
      proxyFetch(endpoints.topRatedTV),
      proxyFetch(endpoints.genres),
    ]);

    const safe = <T,>(p: PromiseSettledResult<T>, fallback: T) => (p.status === 'fulfilled' ? p.value : fallback);

    // Normalize results: many TMDB endpoints return { results: [...], total_pages, ... }
    const trendingRaw = safe(promises[0], { results: [] } as any);
    const popularRaw = safe(promises[1], { results: [] } as any);
    const topRatedRaw = safe(promises[2], { results: [] } as any);
    const latestRaw = safe(promises[3], { results: [] } as any);
    const popularTVRaw = safe(promises[4], { results: [] } as any);
    const topRatedTVRaw = safe(promises[5], { results: [] } as any);
    const genresRaw = safe(promises[6], { genres: [] } as any);

    // pick reasonable fallbacks / slicing
    const trending = (trendingRaw.results ?? []).slice(0, 20);
    const popular = popularRaw.results ?? [];
    const topRated = topRatedRaw.results ?? [];
    const latest = latestRaw.results ?? [];
    const popularTV = popularTVRaw.results ?? [];
    const topRatedTV = topRatedTVRaw.results ?? [];
    const genres = genresRaw.genres ?? [];

    // If everything is empty or proxy returned no useful data, show demo content
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
        error: 'No data returned from TMDB (proxy or TMDB might be down).',
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
    // If any unexpected exception bubbled up, return demo data with the message
    return {
      trending: mockMovies,
      popular: mockMovies,
      topRated: mockMovies,
      latest: mockMovies,
      popularTV: [],
      topRatedTV: [],
      genres: [],
      isDemo: true,
      error: err?.message ?? 'Unknown error when fetching home page data',
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
