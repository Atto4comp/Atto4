// app/browse/latest/page.tsx

import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import LatestReleasesClient from '@/components/pages/LatestReleasesClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// ✅ Configure Static Generation with ISR
export const dynamic = 'force-static';
export const revalidate = 1800; // Revalidate every 30 minutes (latest releases change frequently)

// ✅ Generate Metadata
export const metadata = {
  title: 'Latest Releases - New Movies & TV Shows | Atto4',
  description: 'Discover the latest movie and TV show releases. Watch newly released content in HD quality on Atto4.',
  keywords: ['latest releases', 'new movies', 'new tv shows', 'recent releases', 'Atto4'],
  openGraph: {
    title: 'Latest Releases | Atto4',
    description: 'Recently released movies and TV shows',
    type: 'website',
    url: 'https://atto4.pro/browse/latest',
  },
};

// ✅ Fetch Initial Data
async function getLatestReleasesData() {
  try {
    console.log('📥 Fetching latest releases data at build time...');

    const [movieGenres, tvGenres, latestMovies] = await Promise.all([
      tmdbApi.getMovieGenres(),
      tmdbApi.getTVGenres(),
      tmdbApi.getLatestReleases('movie', 1),
    ]);

    console.log(`✅ Fetched ${latestMovies.results?.length || 0} latest movies`);

    return {
      movieGenres: movieGenres || [],
      tvGenres: tvGenres || [],
      initialItems: latestMovies.results || [],
      totalPages: latestMovies.total_pages || 1,
    };
  } catch (error) {
    console.error('❌ Failed to fetch latest releases data:', error);
    return {
      movieGenres: [],
      tvGenres: [],
      initialItems: [],
      totalPages: 0,
    };
  }
}

// ✅ Main Latest Releases Page
export default async function LatestReleasesPage() {
  const data = await getLatestReleasesData();

  console.log('📅 Rendering static latest releases page');

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <LatestReleasesClient
          initialMovieGenres={data.movieGenres}
          initialTVGenres={data.tvGenres}
          initialItems={data.initialItems}
          initialTotalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
