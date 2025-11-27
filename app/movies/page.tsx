// app/movies/page.tsx

import { Suspense } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import MoviesPageClient from '@/components/pages/MoviesPageClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// ✅ STEP 1: Configure Static Generation with ISR
export const dynamic = 'force-static';  // Force static generation
export const revalidate = 3600;         // Revalidate every hour (movies update frequently)

// ✅ STEP 2: Generate Metadata
export const metadata = {
  title: 'Movies - Discover Blockbusters & Cinema Classics | Atto4',
  description: 'Browse thousands of movies including blockbusters, indie films, and cinema classics. Filter by genre, sort by popularity, and discover your next favorite film.',
  keywords: 'movies, films, cinema, blockbusters, indie movies, watch movies online, Atto4',
  openGraph: {
    title: 'Movies | Atto4',
    description: 'Discover blockbusters, indie films and cinema classics',
    type: 'website',
    url: 'https://atto4.pro/movies',
  },
};

// ✅ STEP 3: Fetch Initial Data at Build Time
async function getMoviesPageData() {
  try {
    console.log('📥 Fetching movies page data at build time...');

    // Fetch genres and initial popular movies in parallel
    const [genres, popularMovies] = await Promise.all([
      tmdbApi.getMovieGenres(),
      tmdbApi.getPopularMovies(1),
    ]);

    console.log(`✅ Fetched ${popularMovies.results?.length || 0} movies and ${genres?.length || 0} genres`);

    return {
      genres: genres || [],
      initialMovies: popularMovies.results || [],
      totalPages: popularMovies.total_pages || 1,
    };
  } catch (error) {
    console.error('❌ Failed to fetch movies page data:', error);
    return {
      genres: [],
      initialMovies: [],
      totalPages: 0,
    };
  }
}

// ✅ STEP 4: Main Movies Page Component (Statically Generated)
export default async function MoviesPage() {
  const data = await getMoviesPageData();

  console.log('🎬 Rendering static movies page');

  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<LoadingSpinner />}>
        <MoviesPageClient 
          initialGenres={data.genres}
          initialMovies={data.initialMovies}
          initialTotalPages={data.totalPages}
        />
      </Suspense>
    </div>
  );
}
