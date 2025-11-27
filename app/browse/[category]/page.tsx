// app/browse/[category]/page.tsx

import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import BrowsePageClient from '@/components/pages/BrowsePageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface BrowsePageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ type?: string }>;
}

// ✅ STEP 1: Generate Static Paths
export async function generateStaticParams() {
  // Pre-render common browse categories
  const categories = [
    'trending',
    'popular',
    'top-rated',
    'upcoming',
    'now-playing',
    'on-the-air',
    'airing-today',
    'latest',
  ];

  console.log(`🔨 Pre-rendering ${categories.length} browse categories`);

  return categories.map((category) => ({
    category,
  }));
}

// ✅ STEP 2: Configure Static Generation with ISR
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true; // Allow on-demand generation

// ✅ STEP 3: Generate Metadata
export async function generateMetadata({ params, searchParams }: BrowsePageProps) {
  const { category } = await params;
  const { type } = await searchParams;
  
  const mediaType = type || (
    ['on-the-air', 'airing-today'].includes(category) ? 'tv' : 'movie'
  );

  const titles: Record<string, string> = {
    'trending': `Trending ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`,
    'popular': `Popular ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`,
    'top-rated': `Top Rated ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`,
    'upcoming': 'Upcoming Movies',
    'now-playing': 'Now Playing Movies',
    'on-the-air': 'On The Air TV Shows',
    'airing-today': 'Airing Today TV Shows',
    'latest': `Latest ${mediaType === 'movie' ? 'Movie' : 'TV Show'} Releases`,
  };

  const title = titles[category] || 'Browse';

  return {
    title: `${title} | Atto4`,
    description: `Discover ${title.toLowerCase()} on Atto4. Stream thousands of titles in HD quality.`,
    keywords: [category, mediaType, 'streaming', 'watch online', 'Atto4'],
  };
}

// ✅ STEP 4: Fetch Initial Data
async function getBrowseData(category: string, mediaType: 'movie' | 'tv') {
  try {
    console.log(`📥 Fetching initial data for ${category} (${mediaType})`);

    const [genres, initialData] = await Promise.all([
      mediaType === 'movie' ? tmdbApi.getMovieGenres() : tmdbApi.getTVGenres(),
      fetchCategoryData(category, mediaType, 1),
    ]);

    return {
      genres: genres || [],
      initialItems: initialData?.results || [],
      totalPages: initialData?.total_pages || 1,
    };
  } catch (error) {
    console.error('Failed to fetch browse data:', error);
    return {
      genres: [],
      initialItems: [],
      totalPages: 0,
    };
  }
}

async function fetchCategoryData(category: string, mediaType: 'movie' | 'tv', page: number) {
  if (mediaType === 'tv') {
    switch (category) {
      case 'trending':
        const trendingResults = await tmdbApi.getTVTrending('week');
        return { results: trendingResults, total_pages: 1 };
      case 'popular':
        return await tmdbApi.getTVByCategory('popular', page);
      case 'top-rated':
        return await tmdbApi.getTVByCategory('top-rated', page);
      case 'on-the-air':
        return await tmdbApi.getTVByCategory('on-the-air', page);
      case 'airing-today':
        return await tmdbApi.getTVByCategory('airing-today', page);
      case 'latest':
        return await tmdbApi.getLatestReleases('tv', page);
      default:
        return await tmdbApi.discoverTVShows({ page });
    }
  } else {
    switch (category) {
      case 'trending':
        const trendingResults = await tmdbApi.getTrending('week');
        return { results: trendingResults, total_pages: 1 };
      case 'popular':
        return await tmdbApi.getPopularMovies(page);
      case 'top-rated':
        return await tmdbApi.getTopRatedMovies(page);
      case 'upcoming':
        return await tmdbApi.getUpcomingMovies(page);
      case 'now-playing':
        return await tmdbApi.getNowPlayingMovies(page);
      case 'latest':
        return await tmdbApi.getLatestReleases('movie', page);
      default:
        return await tmdbApi.getPopularMovies(page);
    }
  }
}

// ✅ STEP 5: Main Browse Page
export default async function BrowsePage({ params, searchParams }: BrowsePageProps) {
  const { category } = await params;
  const { type } = await searchParams;
  
  const defaultMediaType = type || (
    ['on-the-air', 'airing-today'].includes(category) ? 'tv' : 'movie'
  );

  const data = await getBrowseData(category, defaultMediaType as 'movie' | 'tv');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <BrowsePageClient
          category={category}
          defaultMediaType={defaultMediaType as 'movie' | 'tv'}
          initialGenres={data.genres}
          initialItems={data.initialItems}
          initialTotalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}

