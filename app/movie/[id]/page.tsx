// app/movie/[id]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { tmdbApi } from '@/lib/api/tmdb';
import MovieDetailsClient from '@/components/media/MovieDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MoviePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  try {
    console.log('🔨 Building static movie pages...');

    const [popular, topRated, upcoming, nowPlaying] = await Promise.all([
      tmdbApi.getPopularMovies(1),
      tmdbApi.getTopRatedMovies(1),
      tmdbApi.getUpcomingMovies(1),
      tmdbApi.getNowPlayingMovies(1),
    ]);

    const allMovies = [
      ...popular.results,
      ...topRated.results,
      ...upcoming.results,
      ...nowPlaying.results,
    ];

    const uniqueMovieIds = Array.from(new Set(allMovies.map(movie => movie.id)));

    console.log(`📊 Pre-rendering ${uniqueMovieIds.length} movie pages at build time`);

    return uniqueMovieIds.map((id) => ({
      id: id.toString(),
    }));
  } catch (error) {
    console.error('❌ Failed to generate static params:', error);
    return [];
  }
}

export const dynamic = 'force-static';
export const revalidate = 86400; // 24 hours
export const dynamicParams = true;

async function getMovieData(id: string) {
  try {
    const movieId = parseInt(id);
    if (isNaN(movieId) || movieId <= 0) {
      console.error(`❌ Invalid movie ID: ${id}`);
      return null;
    }

    console.log(`📥 Fetching data for movie ID: ${movieId}`);

    const [movieDetails, genres] = await Promise.all([
      tmdbApi.getMovieDetails(movieId),
      tmdbApi.getMovieGenres(),
    ]);

    if (!movieDetails || !movieDetails.id) {
      console.error(`❌ Movie not found: ${movieId}`);
      return null;
    }

    console.log(`✅ Successfully fetched: ${movieDetails.title}`);
    console.log(`📊 Cast data available:`, movieDetails.credits?.cast ? 'YES' : 'NO');

    // Extract cast from credits
    const cast = movieDetails.credits?.cast || [];
    console.log(`👥 Cast members found: ${cast.length}`);

    return {
      movie: movieDetails,
      genres,
      cast: cast.slice(0, 15), // Limit to top 15
    };
  } catch (error) {
    console.error(`❌ Failed to fetch movie data for ID ${id}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  if (!data) {
    return {
      title: 'Movie Not Found',
    };
  }

  return {
    title: `${data.movie.title} - Atto4`,
    description: data.movie.overview || `Watch ${data.movie.title}`,
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params;
  const data = await getMovieData(id);

  if (!data) {
    return notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MovieDetailsClient 
        movie={data.movie} 
        genres={data.genres} 
        cast={data.cast}
      />
    </Suspense>
  );
}
