import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import BrowsePageClient from '@/components/pages/BrowsePageClient'; // Reuse the generic client!
import LoadingSpinner from '@/components/common/LoadingSpinner';

export const dynamic = 'force-static';
export const revalidate = 1800; 

export const metadata = {
  title: 'Latest Releases | Atto4',
  description: 'Watch newly released content on Atto4.',
};

async function getLatestReleasesData() {
  try {
    const [movieGenres, latestMovies] = await Promise.all([
      tmdbApi.getMovieGenres(),
      tmdbApi.getLatestReleases('movie', 1),
    ]);

    return {
      genres: movieGenres || [],
      initialItems: latestMovies.results || [],
      totalPages: latestMovies.total_pages || 1,
    };
  } catch (error) {
    return { genres: [], initialItems: [], totalPages: 0 };
  }
}

export default async function LatestReleasesPage() {
  const data = await getLatestReleasesData();

  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<LoadingSpinner />}>
        {/* Reusing BrowsePageClient since "Latest" is just a category! */}
        <BrowsePageClient
          category="latest"
          defaultMediaType="movie"
          initialGenres={data.genres}
          initialItems={data.initialItems}
          initialTotalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
