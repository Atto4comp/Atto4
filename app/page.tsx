// app/movie/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import MovieDetailsClient from '@/components/media/MovieDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

// ✅ STEP 1: Generate Static Paths (getStaticPaths equivalent)
// This tells Next.js which movie pages to pre-render at build time
export async function generateStaticParams() {
  try {
    console.log('🔨 Building static movie pages...');

    // Fetch multiple sources of movies to pre-render
    const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
      tmdbApi.getPopularMovies(),
      tmdbApi.getTopRatedMovies(),
      tmdbApi.getNowPlayingMovies(),
      tmdbApi.getUpcomingMovies(),
    ]);

    // Combine all movies and remove duplicates
    const allMovies = [
      ...popular.results,
      ...topRated.results,
      ...nowPlaying.results,
      ...upcoming.results,
    ];

    // Get unique movie IDs
    const uniqueMovieIds = Array.from(
      new Set(allMovies.map(movie => movie.id))
    );

    console.log(`📊 Pre-rendering ${uniqueMovieIds.length} movie pages`);

    // Return all unique movie IDs as strings
    // This generates static pages for all these movies at build time
    return uniqueMovieIds.map((id) => ({
      id: id.toString(),
    }));

  } catch (error) {
    console.error('❌ Failed to generate static params:', error);
    return [];
  }
}

// ✅ STEP 2: Configure Static Generation
// Force static generation and set revalidation time
export const dynamic = 'force-static'; // Force static generation
export const revalidate = 86400; // Revalidate every 24 hours (ISR)
export const dynamicParams = true; // Allow dynamic params not in generateStaticParams

// ✅ STEP 3: Fetch Data at Build Time (getStaticProps equivalent)
// This function fetches data for each movie at build time
async function getMovieData(id: string) {
  try {
    const movieId = parseInt(id);
    if (isNaN(movieId)) {
      console.error(`❌ Invalid movie ID: ${id}`);
      return null;
    }

    console.log(`📥 Fetching data for movie ID: ${movieId}`);

    // Fetch movie details and genres at build time
    const [movieDetails, genres] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieGenres(),
    ]);

    console.log(`✅ Data fetched for: ${movieDetails.title}`);

    return {
      movie: movieDetails,
      genres,
    };
  } catch (error) {
    console.error(`❌ Failed to fetch movie data for ID ${id}:`, error);
    return null;
  }
}

// ✅ STEP 4: Generate Metadata for SEO
// This creates meta tags for each static page
export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  if (!data || !data.movie) {
    return {
      title: 'Movie Not Found',
      description: 'The requested movie could not be found.',
    };
  }

  const { movie } = data;

  // Build direct TMDB image URLs (no API key needed)
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` 
    : undefined;
  
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : undefined;

  return {
    title: `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}) | Watch Online - Atto4`,
    description: movie.overview || `Watch ${movie.title} online. ${movie.tagline || ''}`,
    keywords: [
      movie.title,
      'watch online',
      'stream movie',
      'Atto4',
      ...(movie.genres?.map(g => g.name) || []),
    ].join(', '),
    openGraph: {
      title: movie.title,
      description: movie.overview,
      type: 'video.movie',
      url: `https://atto4.pro/movie/${movie.id}`,
      images: [
        {
          url: backdropUrl || posterUrl || '',
          width: 1280,
          height: 720,
          alt: `${movie.title} backdrop`,
        },
        ...(posterUrl ? [{
          url: posterUrl,
          width: 780,
          height: 1170,
          alt: `${movie.title} poster`,
        }] : []),
      ],
      releaseDate: movie.release_date,
    },
    twitter: {
      card: 'summary_large_image',
      title: movie.title,
      description: movie.overview,
      images: [backdropUrl || posterUrl || ''],
    },
  };
}

// ✅ STEP 5: Main Page Component
// This renders the static page with pre-fetched data
export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  // If movie not found, show 404
  if (!data || !data.movie) {
    notFound();
  }

  console.log(`🎬 Rendering static page for: ${data.movie.title}`);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Suspense fallback={<LoadingSpinner />}>
        <MovieDetailsClient movie={data.movie} genres={data.genres} />
      </Suspense>
    </main>
  );
}
