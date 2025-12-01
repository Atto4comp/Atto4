// app/page.tsx
import { Suspense } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { tmdbApi } from '@/lib/api/tmdb';
import HeroSection from '@/components/media/HeroSection';
import MediaRow from '@/components/media/MediaRow';
import WatchlistRow from '@/components/media/WatchlistRow';
import LikedRow from '@/components/media/LikedRow';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BannerAd from '@/components/ads/BannerAd'; // ✅ IMPORTED

// make this static with ISR
export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

const DATA_HOME = path.join(process.cwd(), 'data', 'homepage.json');

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
  },
];

async function readSnapshot() {
  try {
    const raw = await fs.readFile(DATA_HOME, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getHomePageData() {
  // Prefer local snapshot (fast)
  const snapshot = await readSnapshot();
  if (snapshot) {
    return { ...snapshot, isDemo: false, error: undefined };
  }

  // fallback: try runtime tmdbApi (this will be done during build if snapshot absent)
  try {
    const connection = await tmdbApi.testConnection();
    if (!connection.success) {
      return {
        trending: mockMovies,
        popular: mockMovies,
        topRated: mockMovies,
        latest: mockMovies,
        popularTV: [],
        topRatedTV: [],
        genres: [],
        isDemo: true,
        error: connection.message,
      };
    }

    const [
      trending,
      popularRes,
      topRatedRes,
      latestRes,
      popularTVRes,
      topRatedTVRes,
      genres,
    ] = await Promise.allSettled([
      tmdbApi.getTrending(),
      tmdbApi.getPopularMovies(),
      tmdbApi.getTopRatedMovies(),
      tmdbApi.getLatestReleases('movie', 1),
      tmdbApi.getTVByCategory('popular'),
      tmdbApi.getTVByCategory('top-rated'),
      tmdbApi.getMovieGenres(),
    ]);

    const safe = <T,>(p: PromiseSettledResult<T>, fallback: T) =>
      p.status === 'fulfilled' ? p.value : fallback;

    return {
      trending: safe(trending, [] as any[]).slice(0, 20) || mockMovies,
      popular: safe(popularRes, { results: [] }).results || mockMovies,
      topRated: safe(topRatedRes, { results: [] }).results || mockMovies,
      latest: safe(latestRes, { results: [] }).results || mockMovies,
      popularTV: safe(popularTVRes, { results: [] }).results,
      topRatedTV: safe(topRatedTVRes, { results: [] }).results,
      genres: safe(genres, [] as any[]),
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
      error: err.message ?? 'Unknown error',
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
          {error
            ? `API Error: ${error}`
            : 'Showing demo content — Check your TMDB API key or network.'}
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection media={(trending || []).slice(0, 5)} />
      </Suspense>
      
      <meta name="b2b4e492a079f757d4b5bb735a0b869a6c6db20e" content="b2b4e492a079f757d4b5bb735a0b869a6c6db20e" />
      
      {/* ✅ ADVERTISEMENT SLOT ADDED HERE */}
      <BannerAd />

      <div className="relative z-10 pt-16 pb-20 bg-b from-black via-gray-900 to-black space-y-16">
        <MediaRow title="Trending Movies" items={trending} genres={genres} category="trending" mediaType="movie" priority />
        <MediaRow title="Popular Movies" items={popular} genres={genres} category="popular" mediaType="movie" />
        <MediaRow title="Top-Rated Movies" items={topRated} genres={genres} category="top-rated" mediaType="movie" />
        <MediaRow title="Latest Movies" items={latest} genres={genres} category="latest" mediaType="movie" />

        {popularTV?.length > 0 && (
          <MediaRow title="Popular TV Shows" items={popularTV} genres={genres} category="popular" mediaType="tv" />
        )}
        {topRatedTV?.length > 0 && (
          <MediaRow title="Top-Rated TV Shows" items={topRatedTV} genres={genres} category="top-rated" mediaType="tv" />
        )}

        <Suspense fallback={<div className="h-64" />}><WatchlistRow /></Suspense>
        <Suspense fallback={<div className="h-64" />}><LikedRow /></Suspense>
      </div>
    </main>
  );
}
