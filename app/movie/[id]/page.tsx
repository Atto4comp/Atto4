// app/movie/[id]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import MovieDetailsClient from '@/components/media/MovieDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface MoviePageProps {
  params: { id: string };
}

// Tune this per your preference. Movie details are relatively static -> 1 day.
export const revalidate = 86400; // seconds (24 hours)

/**
 * Server-side helper to call the proxy route.
 * Uses Next fetch with `next.revalidate` so cache and ISR behave consistently.
 */
async function proxyFetch(path: string) {
  // If NEXT_PUBLIC_SITE_ORIGIN is set, use absolute path; otherwise relative path works on Next server runtime.
  const base = process.env.NEXT_PUBLIC_SITE_ORIGIN?.replace(/\/$/, '') ?? '';
  const fetchUrl = base ? `${base}/api/tmdb/proxy${path}` : `/api/tmdb/proxy${path}`;

  const res = await fetch(fetchUrl, {
    headers: { Accept: 'application/json' },
    next: { revalidate },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err: any = new Error('Proxy fetch failed');
    err.status = res.status;
    err.body = text;
    throw err;
  }

  return res.json();
}

async function getMovieData(id: string) {
  const movieId = Number(id);
  if (!Number.isFinite(movieId) || movieId <= 0) return null;

  try {
    // Use TMDB "append_to_response" to fetch credits, videos, similar, recommendations in one call
    const moviePath = `/movie/${movieId}?append_to_response=credits,videos,similar,recommendations&language=en-US`;
    const genresPath = `/genre/movie/list?language=en-US`;

    const [movieResult, genresResult] = await Promise.allSettled([
      proxyFetch(moviePath),
      proxyFetch(genresPath),
    ]);

    if (movieResult.status === 'rejected') {
      const err = movieResult.reason;
      // If TMDB returned 404, treat as notFound
      if (err?.status === 404) return null;
      // Otherwise log and bubble a null so we can show notFound or fallback
      console.error('Error fetching movie details:', err);
      return null;
    }

    const movie = movieResult.value;
    const genres = genresResult.status === 'fulfilled' ? genresResult.value?.genres ?? [] : [];

    // minimal validation that we have a movie
    if (!movie || !movie.id) return null;

    return { movie, genres };
  } catch (err) {
    console.error('Unexpected error in getMovieData:', err);
    return null;
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const data = await getMovieData(params.id);

  if (!data || !data.movie) {
    // Let Next handle 404 page
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

