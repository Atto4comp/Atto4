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
    
    // Return first 100 popular movie IDs (adjust as needed)
    return popularMovies.results.slice(0, 100).map((movie) => ({
      id: movie.id.toString(),
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// ✅ Enable static rendering with revalidation
export const dynamic = 'force-static';
export const revalidate = 86400; // Revalidate once per day (24 hours)

async function getMovieData(id: string) {
  try {
    const movieId = parseInt(id);
    if (isNaN(movieId)) {
      return null;
    }

    const [movieDetails, genres] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieGenres(),
    ]);

    return {
      movie: movieDetails,
      genres,
    };
  } catch (error) {
    console.error('Failed to fetch movie data:', error);
    return null;
  }
}

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

// ✅ Generate metadata for SEO
export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  if (!data || !data.movie) {
    return {
      title: 'Movie Not Found',
    };
  }

  return {
    title: `${data.movie.title} - Atto4`,
    description: data.movie.overview,
    openGraph: {
      title: data.movie.title,
      description: data.movie.overview,
      images: [
        {
          url: `https://image.tmdb.org/t/p/w1280${data.movie.backdrop_path}`,
          width: 1280,
          height: 720,
        },
      ],
    },
  };
}
