// app/movie/[id]/page.tsx
import fs from 'fs';
import path from 'path';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import MovieDetailsClient from '@/components/media/MovieDetailsClient';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { MediaDetails } from '@/lib/api/types';

interface MoviePageProps {
  params: { id: string };
}

// Force static rendering (SSG)
export const dynamic = 'force-static';
// fully static page — rebuild to refresh (set to false). If you prefer ISR set a number.
export const revalidate = false;

const DATA_DIR = path.join(process.cwd(), 'data', 'movies');
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const SKIP_SSG_FETCH = String(process.env.SKIP_SSG_FETCH ?? '0') === '1';
const FETCH_TIMEOUT_MS = 7000;

function safeReadMovieSnapshot(id: string): any | null {
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to read movie snapshot for', id, err);
    return null;
  }
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeout = FETCH_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function buildTmdbUrl(pathname: string, params: Record<string, any> = {}) {
  const url = new URL(`${TMDB_BASE}${pathname}`);
  const sp = new URLSearchParams({ api_key: TMDB_API_KEY ?? '' });
  Object.entries(params).forEach(([k, v]) => {
    if (v == null) return;
    sp.set(k, String(v));
  });
  url.search = sp.toString();
  return url.toString();
}

/**
 * Attempts snapshot -> server fetch (if allowed) -> demo fallback
 */
async function getMovieData(id: string): Promise<{ movie: MediaDetails | null; genres: any[] }> {
  // 1) Try snapshot (fast, build-time)
  const snapshot = safeReadMovieSnapshot(id);
  if (snapshot && snapshot.movie) {
    return { movie: snapshot.movie as MediaDetails, genres: snapshot.genres ?? [] };
  }

  // 2) If snapshot missing, try server-side TMDB fetch ONLY if key present and not skipped
  if (TMDB_API_KEY && !SKIP_SSG_FETCH) {
    try {
      // Use append_to_response to fetch credits, videos, similar, recommendations in one go
      const movieUrl = buildTmdbUrl(`/movie/${id}`, {
        append_to_response: 'credits,videos,similar,recommendations',
        language: 'en-US',
      });

      const genresUrl = buildTmdbUrl('/genre/movie/list', { language: 'en-US' });

      const [movieRes, genresRes] = await Promise.all([
        fetchWithTimeout(movieUrl, { headers: { Accept: 'application/json' } }, FETCH_TIMEOUT_MS),
        fetchWithTimeout(genresUrl, { headers: { Accept: 'application/json' } }, FETCH_TIMEOUT_MS),
      ]);

      if (!movieRes.ok) {
        if (movieRes.status === 404) return { movie: null, genres: [] };
        // otherwise fall through to demo fallback
      } else {
        const movieJson = await movieRes.json();
        const genresJson = genresRes.ok ? (await genresRes.json()).genres ?? [] : [];
        return { movie: movieJson as MediaDetails, genres: genresJson };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('TMDB fetch failed for movie', id, err);
      // fall through to demo
    }
  }

  // 3) Demo fallback (keeps build from failing)
  const demo: any = {
    id: Number(id) || 0,
    title: 'Demo Movie',
    overview: 'Demo fallback: movie details are not available at build time.',
    poster_path: null,
    backdrop_path: null,
    release_date: '2025-01-01',
    vote_average: 0,
    vote_count: 0,
    genres: [],
    credits: { cast: [], crew: [] },
    videos: { results: [] },
    similar: { results: [] },
  };

  return { movie: demo, genres: [] };
}

/**
 * Try to generate params from data/movies snapshot files first (fast).
 * If none present and TMDB_API_KEY available and SKIP_SSG_FETCH !== '1',
 * fetch popular/top-rated movie ids to pre-render.
 */
export async function generateStaticParams() {
  try {
    // read snapshot folder
    if (fs.existsSync(DATA_DIR)) {
      const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'));
      if (files.length > 0) {
        return files.map((f) => ({ id: path.basename(f, '.json') }));
      }
    }

    // no snapshots — if allowed, fetch a limited set from TMDB
    if (TMDB_API_KEY && !SKIP_SSG_FETCH) {
      const popularUrl = buildTmdbUrl('/movie/popular', { page: 1 });
      const topRatedUrl = buildTmdbUrl('/movie/top_rated', { page: 1 });

      try {
        const [popRes, topRes] = await Promise.all([
          fetchWithTimeout(popularUrl, { headers: { Accept: 'application/json' } }, FETCH_TIMEOUT_MS),
          fetchWithTimeout(topRatedUrl, { headers: { Accept: 'application/json' } }, FETCH_TIMEOUT_MS),
        ]);

        const popJson = popRes.ok ? await popRes.json() : { results: [] };
        const topJson = topRes.ok ? await topRes.json() : { results: [] };

        const allIds = Array.from(
          new Set([
            ...(popJson.results ?? []).map((m: any) => m.id),
            ...(topJson.results ?? []).map((m: any) => m.id),
          ])
        );

        // limit how many we statically generate to avoid long builds
        return allIds.slice(0, 200).map((id) => ({ id: String(id) }));
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Failed to fetch popular/top-rated for generateStaticParams:', err);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('generateStaticParams error:', err);
  }

  // fallback to no params (pages will be generated on-demand as static files since force-static)
  return [];
}

// metadata generator uses the same static-first logic
export async function generateMetadata({ params }: MoviePageProps) {
  const id = params.id;
  const { movie } = await getMovieData(id);
  if (!movie) {
    return {
      title: 'Movie Not Found',
      description: 'The requested movie could not be found.',
    };
  }

  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w780${movie.poster_path}` : undefined;
  const backdropUrl = movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : undefined;

  return {
    title: `${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}) - Atto4`,
    description: movie.overview ?? '',
    openGraph: {
      title: movie.title,
      description: movie.overview,
      url: `https://atto4.pro/movie/${movie.id}`,
      images: [{ url: backdropUrl || posterUrl || '', width: 1280, height: 720, alt: `${movie.title}` }],
    },
  };
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = params;
  const { movie, genres } = await getMovieData(id);

  // If movie is explicitly null (TMDB returned 404) — show 404
  if (movie === null) {
    notFound();
  }

  // otherwise render (demo fallback allowed)
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      <Suspense fallback={<LoadingSpinner />}>
        <MovieDetailsClient movie={movie as MediaDetails} genres={genres} />
      </Suspense>
    </main>
  );
}
