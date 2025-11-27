// app/movie/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import MovieDetailsClient from '@/components/media/MovieDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

// ✅ STEP 1: Generate Static Paths (Pre-render popular movies at build time)
export async function generateStaticParams() {
  try {
    console.log('🔨 Building static movie pages...');

    // Fetch multiple movie lists to maximize pre-rendered pages
    const [popular, topRated, nowPlaying, upcoming] = await Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getTopRatedMovies(1),
      tmdbApi.getNowPlayingMovies(1),
      tmdbApi.getUpcomingMovies(1),
    ]);

    // Combine all movies
    const allMovies = [
      ...popular.results,
      ...topRated.results,
      ...nowPlaying.results,
      ...upcoming.results,
    ];

    // Remove duplicates by ID
    const uniqueMovieIds = Array.from(
      new Set(allMovies.map(movie => movie.id))
    );

    console.log(`📊 Pre-rendering ${uniqueMovieIds.length} movie pages at build time`);

    // Return movie IDs as strings for static generation
    return uniqueMovieIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('❌ Failed to generate static params:', error);
    return [];
  }
}

// ✅ STEP 2: Configure Static Rendering with ISR
export const dynamic = 'force-static';  // Force static generation
export const revalidate = 86400;        // Revalidate every 24 hours (ISR)
export const dynamicParams = true;      // Allow on-demand generation for movies not pre-rendered

// ✅ STEP 3: Fetch Movie Data at Build Time
async function getMovieData(id: string) {
  try {
    const movieId = parseInt(id);
    if (isNaN(movieId)) {
      console.error(`❌ Invalid movie ID: ${id}`);
      return null;
    }

    console.log(`📥 Fetching data for movie ID: ${movieId}`);

    // Fetch movie details and genres in parallel
    const [movieDetails, genres] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieGenres(),
    ]);

    if (!movieDetails) {
      console.error(`❌ Movie not found: ${movieId}`);
      return null;
    }

    console.log(`✅ Successfully fetched: ${movieDetails.title}`);

    return {
      movie: movieDetails,
      genres,
    };
  } catch (error) {
    console.error(`❌ Failed to fetch movie data for ID ${id}:`, error);
    return null;
  }
}

// ✅ STEP 4: Generate SEO Metadata (Built at compile time)
export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  if (!data || !data.movie) {
    return {
      title: 'Movie Not Found | Atto4',
      description: 'The requested movie could not be found.',
    };
  }

  const { movie } = data;

  // Build direct TMDB image URLs (no API key needed for images)
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` 
    : undefined;
  
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : undefined;

  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : 'N/A';

  return {
    title: `${movie.title} (${releaseYear}) | Watch Online - Atto4`,
    description: movie.overview || `Watch ${movie.title} online. ${movie.tagline || 'Stream now on Atto4.'}`,
    keywords: [
      movie.title,
      'watch online',
      'stream movie',
      'free movie',
      'Atto4',
      ...(movie.genres?.map(g => g.name) || []),
    ].join(', '),
    openGraph: {
      title: `${movie.title} (${releaseYear})`,
      description: movie.overview,
      type: 'video.movie',
      url: `https://atto4.pro/movie/${movie.id}`,
      siteName: 'Atto4',
      images: [
        ...(backdropUrl ? [{
          url: backdropUrl,
          width: 1280,
          height: 720,
          alt: `${movie.title} backdrop`,
        }] : []),
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
      site: '@Atto4',
      title: movie.title,
      description: movie.overview,
      images: [backdropUrl || posterUrl || ''],
    },
    alternates: {
      canonical: `https://atto4.pro/movie/${movie.id}`,
    },
  };
}

// ✅ STEP 5: Main Movie Page Component (Statically Generated)
export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  // Show 404 if movie not found
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
