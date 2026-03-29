// app/genres/page.tsx

import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import GenresPageClient from '@/components/pages/GenresPageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// ✅ Configure Static Generation with ISR
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate every 24 hours (genres don't change often)

// ✅ Generate Metadata
export const metadata = {
  title: 'Browse by Genre - Movies & TV Shows | Atto4',
  description: 'Explore movies and TV shows by genre. Find action, comedy, drama, thriller, horror, and more on Atto4.',
  keywords: ['genres', 'movie genres', 'tv genres', 'action', 'comedy', 'drama', 'thriller', 'Atto4'],
  openGraph: {
    title: 'Browse by Genre | Atto4',
    description: 'Browse content by your favorite genres',
    type: 'website',
    url: 'https://atto4.pro/genres',
  },
};

// ✅ Fetch Initial Data
async function getGenresData() {
  try {
    console.log('📥 Fetching genres data at build time...');

    const [movieGenres, tvGenres] = await Promise.all([
      tmdbApi.getMovieGenres(),
      tmdbApi.getTVGenres(),
    ]);

    // Combine and deduplicate genres
    const combined = [...(movieGenres || []), ...(tvGenres || [])];
    const uniqueGenres = combined
      .filter((genre, index, arr) => 
        arr.findIndex(g => g.id === genre.id) === index
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`✅ Fetched ${uniqueGenres.length} unique genres`);

    return {
      allGenres: uniqueGenres,
      movieGenres: movieGenres || [],
      tvGenres: tvGenres || [],
    };
  } catch (error) {
    console.error('❌ Failed to fetch genres data:', error);
    return {
      allGenres: [],
      movieGenres: [],
      tvGenres: [],
    };
  }
}

// ✅ Main Genres Page
export default async function GenresPage() {
  const data = await getGenresData();

  console.log('🎭 Rendering static genres page');

  return (
    <div className="min-h-screen text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <GenresPageClient
          initialGenres={data.allGenres}
          movieGenres={data.movieGenres}
          tvGenres={data.tvGenres}
        />
      </Suspense>
    </div>
  );
}
