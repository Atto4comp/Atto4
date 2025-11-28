import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import BrowsePageClient from '@/components/pages/BrowsePageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface BrowsePageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateStaticParams() {
  const categories = [
    'trending', 'popular', 'top-rated', 'upcoming',
    'now-playing', 'on-the-air', 'airing-today', 'latest',
  ];
  return categories.map((category) => ({ category }));
}

export const dynamic = 'force-static';
export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params, searchParams }: BrowsePageProps) {
  const { category } = await params;
  const { type } = await searchParams;
  const mediaType = type || (['on-the-air', 'airing-today'].includes(category) ? 'tv' : 'movie');
  const titleStr = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `${titleStr} - ${mediaType === 'movie' ? 'Movies' : 'TV Shows'} | Atto4`,
    description: `Browse ${category} content on Atto4.`,
  };
}

async function getBrowseData(category: string, mediaType: 'movie' | 'tv') {
  try {
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
    return { genres: [], initialItems: [], totalPages: 0 };
  }
}

async function fetchCategoryData(category: string, mediaType: 'movie' | 'tv', page: number) {
  if (mediaType === 'tv') {
    switch (category) {
      case 'trending': return { results: await tmdbApi.getTVTrending('week'), total_pages: 1 };
      case 'popular': return await tmdbApi.getTVByCategory('popular', page);
      case 'top-rated': return await tmdbApi.getTVByCategory('top-rated', page);
      case 'on-the-air': return await tmdbApi.getTVByCategory('on-the-air', page);
      case 'airing-today': return await tmdbApi.getTVByCategory('airing-today', page);
      case 'latest': return await tmdbApi.getLatestReleases('tv', page);
      default: return await tmdbApi.discoverTVShows({ page });
    }
  } else {
    switch (category) {
      case 'trending': return { results: await tmdbApi.getTrending('week'), total_pages: 1 };
      case 'popular': return await tmdbApi.getPopularMovies(page);
      case 'top-rated': return await tmdbApi.getTopRatedMovies(page);
      case 'upcoming': return await tmdbApi.getUpcomingMovies(page);
      case 'now-playing': return await tmdbApi.getNowPlayingMovies(page);
      case 'latest': return await tmdbApi.getLatestReleases('movie', page);
      default: return await tmdbApi.getPopularMovies(page);
    }
  }
}

export default async function BrowsePage({ params, searchParams }: BrowsePageProps) {
  const { category } = await params;
  const { type } = await searchParams;
  const defaultMediaType = type || (['on-the-air', 'airing-today'].includes(category) ? 'tv' : 'movie');
  const data = await getBrowseData(category, defaultMediaType as 'movie' | 'tv');

  return (
    <div className="min-h-screen bg-black text-white">
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
