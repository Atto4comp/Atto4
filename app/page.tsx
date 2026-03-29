// app/page.tsx
import { Suspense } from 'react';
import fs from 'fs/promises';
import path from 'path';
import { tmdbApi } from '@/lib/api/tmdb';
import type { Genre, Movie } from '@/lib/api/types';
import HeroSection from '@/components/media/HeroSection';
import MediaRow from '@/components/media/MediaRow';
import WatchlistRow from '@/components/media/WatchlistRow';
import LikedRow from '@/components/media/LikedRow';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import BannerAd from '@/components/ads/BannerAd'; 

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
  const snapshot = await readSnapshot();
  if (snapshot) {
    return { ...snapshot, isDemo: false, error: undefined };
  }

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
      trending: safe(trending, [] as Movie[]).slice(0, 20) || mockMovies,
      popular: safe(popularRes, { results: [] }).results || mockMovies,
      topRated: safe(topRatedRes, { results: [] }).results || mockMovies,
      latest: safe(latestRes, { results: [] }).results || mockMovies,
      popularTV: safe(popularTVRes, { results: [] }).results,
      topRatedTV: safe(topRatedTVRes, { results: [] }).results,
      genres: safe(genres, [] as Genre[]),
      isDemo: false,
      error: undefined,
    };
  } catch (err: unknown) {
    return {
      trending: mockMovies,
      popular: mockMovies,
      topRated: mockMovies,
      latest: mockMovies,
      popularTV: [],
      topRatedTV: [],
      genres: [],
      isDemo: true,
      error: err instanceof Error ? err.message : 'Unknown error',
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
    <main className="relative min-h-screen">
      
      {(isDemo || error) && (
        <div className="sticky top-0 z-40 border-b border-amber-400/10 bg-amber-400/8 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200/72 backdrop-blur-md">
          {error
            ? `API Error: ${error}`
            : 'Showing demo content — Check your TMDB API key or network.'}
        </div>
      )}

      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection media={(trending || []).slice(0, 5)} genres={genres} />
      </Suspense>
      
      {/* Meta Tags for Ads */}
      <meta name="google-adsense-account" content="ca-pub-6668961984680825" />
      <meta name="b2b4e492a079f757d4b5bb735a0b869a6c6db20e" content="b2b4e492a079f757d4b5bb735a0b869a6c6db20e" />
      <meta name="monetag" content="b9b033ecae1bfb91e08c27b64bd425be" />
      <meta name="clckd" content="fe3300dbc05d420fca54fc1ebed516ba" />

      <div className="relative z-10 pb-16 pt-4 md:pt-6">
        <MediaRow title="Trending Now" items={trending} genres={genres} category="trending" mediaType="movie" priority />
        <MediaRow title="Popular Movies" items={popular} genres={genres} category="popular" mediaType="movie" />
        
        {/* Ad placement after initial content hook */}
        <div className="section-shell my-2">
          <BannerAd />
        </div>

        <MediaRow title="Top Rated" items={topRated} genres={genres} category="top-rated" mediaType="movie" />
        <MediaRow title="New Releases" items={latest} genres={genres} category="latest" mediaType="movie" />

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
