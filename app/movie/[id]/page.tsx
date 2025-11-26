// app/movie/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import MovieDetailsClient from '@/components/media/MovieDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

// ✅ Generate static paths for popular movies at build time
export async function generateStaticParams() {
  try {
    // Fetch popular movies to pre-render
    const popularMovies = await tmdbApi.getPopularMovies();
    
    // Also fetch top rated movies
    const topRatedMovies = await tmdbApi.getTopRatedMovies();
    
    // Combine and deduplicate movie IDs
    const allMovies = [...popularMovies.results, ...topRatedMovies.results];
    const uniqueMovieIds = Array.from(new Set(allMovies.map(m => m.id)));
    
    // Return first 200 movie IDs for static generation
    return uniqueMovieIds.slice(0, 200).map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// ✅ Enable static rendering with ISR (Incremental Static Regeneration)
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day (24 hours)

// ✅ Fetch movie data with direct TMDB image URLs
async function getMovieData(id: string) {
  try {
    const movieId = parseInt(id);
    if (isNaN(movieId)) {
      return null;
    }

    // Fetch movie details and genres in parallel
    const [movieDetails, genres] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieGenres(),
    ]);

    // Images are already in the format: /path/to/image.jpg
    // No need to fetch image URLs separately - we'll build them directly in the client
    return {
      movie: movieDetails,
      genres,
    };
  } catch (error) {
    console.error('Failed to fetch movie data:', error);
    return null;
  }
}

// ✅ Generate metadata for SEO with direct TMDB image URLs
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

  // ✅ Build TMDB image URLs directly (no API key needed)
  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` 
    : undefined;
  
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : undefined;

  return {
    title: `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}) - Atto4`,
    description: movie.overview || `Watch ${movie.title} on Atto4`,
    keywords: [
      movie.title,
      'watch online',
      'stream movie',
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

// ✅ Main page component
export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  if (!data || !data.movie) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Suspense fallback={<LoadingSpinner />}>
        <MovieDetailsClient movie={data.movie} genres={data.genres} />
      </Suspense>
    </main>
  );
}
