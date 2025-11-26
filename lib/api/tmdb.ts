// lib/api/tmdb.ts
/**
 * TMDB API helpers — ISR-ready
 *
 * Goals:
 * - Use native fetch so Next.js can apply `next: { revalidate }` for ISR.
 * - Keep retries + structured errors for robustness.
 * - Provide image URL helpers that DO NOT use an API key (image CDN is public).
 * - Make search endpoints server-safe (no caching) and list/detail endpoints ISR-cached.
 *
 * NOTE: TMDB metadata endpoints (lists, details, search) require an API key.
 *       TMDB images do NOT require an API key and should be fetched directly
 *       from the image CDN using tmdbImageUrl().
 */

import type { Movie, TVShow, Genre, MediaDetails } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const API_KEY = (process.env.NEXT_PUBLIC_TMDB_API_KEY || '').trim();

/* eslint-disable no-console */
if (!API_KEY) {
  console.warn(
    '[tmdb] WARNING: NEXT_PUBLIC_TMDB_API_KEY is not set. Server-side TMDB metadata requests will fail. Images from image.tmdb.org do NOT need an API key.'
  );
}
/* eslint-enable no-console */

/** Build TMDB image URL (no API key required). size examples: w154, w342, w780, original */
export function tmdbImageUrl(path: string | null | undefined, size = 'w780') {
  if (!path) return '/images/fallback-poster.png';
  // ensure leading slash
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${p}`;
}

/**
 * Low-level fetch wrapper with retry/backoff and Next.js revalidate integration.
 * - path: TMDB API path starting with '/'
 * - params: query params (excluding api_key)
 * - opts.revalidateSeconds: number | 0 (0 disables caching on server)
 * - opts.maxRetries: retry attempts for transient failures
 */
async function fetchFromTmdb<T = any>(
  path: string,
  params: Record<string, any> = {},
  opts?: { revalidateSeconds?: number; maxRetries?: number }
): Promise<T> {
  // metadata requires API key
  if (!API_KEY) {
    throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY at runtime');
  }

  const maxRetries = opts?.maxRetries ?? 3;
  const revalidateSeconds = typeof opts?.revalidateSeconds === 'number' ? opts.revalidateSeconds : 3600;

  const search = new URLSearchParams({ api_key: API_KEY, ...params });
  const url = `${TMDB_BASE_URL}${path}?${search.toString()}`;

  let attempt = 0;
  let lastErr: any = null;

  while (attempt < maxRetries) {
    attempt += 1;
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        // Next.js will read next option during server-rendered fetches (ISR)
        next: { revalidate: revalidateSeconds },
      });

      if (res.status === 401) {
        const e: any = new Error(`TMDB 401: Invalid API key for ${path}`);
        e.status = 401;
        throw e;
      }
      if (res.status === 404) {
        const e: any = new Error(`TMDB 404: Not found ${path}`);
        e.status = 404;
        throw e;
      }
      if (!res.ok) {
        const body = await safeReadBody(res);
        const err = new Error(`TMDB ${res.status} ${res.statusText} for ${path} body=${body}`);
        (err as any).status = res.status;
        throw err;
      }

      const json = (await res.json()) as T;
      return json;
    } catch (err: any) {
      lastErr = err;
      const isClientNetworkError = err instanceof TypeError || ['ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT', 'ECONNABORTED'].includes(err?.code);
      const isLast = attempt >= maxRetries;

      // don't retry on auth or not found
      if (err?.status === 401 || err?.status === 404) throw err;

      if (isLast) {
        const out = new Error(`TMDB request failed (${path}): ${String(err?.message ?? err)}`);
        (out as any).original = err;
        throw out;
      }

      // backoff
      const backoff = Math.pow(2, attempt - 1) * 500;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, backoff));
      // retry loop
    }
  }

  throw lastErr ?? new Error('Unknown TMDB fetch error');
}

async function safeReadBody(res: Response) {
  try {
    const txt = await res.text();
    return txt.length > 400 ? `${txt.slice(0, 400)}...` : txt;
  } catch {
    return '';
  }
}

/* ---------------------------
 * Public API surface (ISR-ready)
 * --------------------------- */
export const tmdbApi = {
  // Lists & trending (suitable for ISR)
  async getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<Movie[]> {
    try {
      const data = await fetchFromTmdb<{ results: Movie[] }>(`/trending/movie/${timeWindow}`, {}, { revalidateSeconds: 3600 });
      return data?.results ?? [];
    } catch (err: any) {
      console.warn('[tmdbApi] getTrending failed:', err?.message ?? err);
      return [];
    }
  },

  async getTVTrending(timeWindow: 'day' | 'week' = 'week'): Promise<TVShow[]> {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[] }>(`/trending/tv/${timeWindow}`, {}, { revalidateSeconds: 3600 });
      return data?.results ?? [];
    } catch (err: any) {
      console.warn('[tmdbApi] getTVTrending failed:', err?.message ?? err);
      return [];
    }
  },

  async getPopularMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/popular`, { page }, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getPopularMovies failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getTopRatedMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/top_rated`, { page }, { revalidateSeconds: 86400 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getTopRatedMovies failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getUpcomingMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/upcoming`, { page }, { revalidateSeconds: 86400 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getUpcomingMovies failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getNowPlayingMovies(page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/now_playing`, { page }, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getNowPlayingMovies failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getPopularTVShows(page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/popular`, { page }, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getPopularTVShows failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getTopRatedTVShows(page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/top_rated`, { page }, { revalidateSeconds: 86400 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getTopRatedTVShows failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getOnTheAirTVShows(page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/on_the_air`, { page }, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getOnTheAirTVShows failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getAiringTodayTVShows(page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/airing_today`, { page }, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getAiringTodayTVShows failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  // category helper
  async getTVByCategory(category: string, page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      let endpoint = '/tv/popular';
      switch (category) {
        case 'popular':
          endpoint = '/tv/popular';
          break;
        case 'top-rated':
          endpoint = '/tv/top_rated';
          break;
        case 'on-the-air':
          endpoint = '/tv/on_the_air';
          break;
        case 'airing-today':
          endpoint = '/tv/airing_today';
          break;
        default:
          endpoint = '/tv/popular';
      }
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(endpoint, { page }, { revalidateSeconds: 3600 });
      const filtered = (data?.results ?? []).filter((r) => !!r.name && !!r.first_air_date);
      return { results: filtered, total_pages: data?.total_pages ?? 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getTVByCategory failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async discoverTVShows(opts: { page?: number; genreId?: number; sortBy?: string; year?: number; minRating?: number } = {}): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      const params: any = {
        page: opts.page ?? 1,
        sort_by: opts.sortBy ?? 'popularity.desc',
        'vote_count.gte': 10,
      };
      if (opts.genreId) params.with_genres = opts.genreId;
      if (opts.year) params.first_air_date_year = opts.year;
      if (opts.minRating) params['vote_average.gte'] = opts.minRating;

      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/discover/tv`, params, { revalidateSeconds: 3600 });
      const filtered = (data?.results ?? []).filter((s) => !!s.name && !!s.first_air_date);
      return { results: filtered, total_pages: data?.total_pages ?? 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] discoverTVShows failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getLatestReleases(mediaType: 'movie' | 'tv' = 'movie', page = 1, genreId?: number): Promise<{ results: any[]; total_pages: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const params: any = {
        sort_by: mediaType === 'tv' ? 'first_air_date.desc' : 'release_date.desc',
        page,
        'vote_count.gte': 10,
      };
      if (mediaType === 'movie') params['release_date.lte'] = today;
      if (mediaType === 'tv') params['first_air_date.lte'] = today;
      if (genreId) params.with_genres = genreId;

      const data = await fetchFromTmdb(`/discover/${mediaType}`, params, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getLatestReleases failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  // Search endpoints — recommended to call directly from client (no caching)
  async searchMulti(query: string, params: { page?: number } = { page: 1 }): Promise<{ results: any[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb('/search/multi', { query, ...(params || {}) }, { revalidateSeconds: 0 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] searchMulti failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async searchMovies(query: string, page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb('/search/movie', { query, page }, { revalidateSeconds: 0 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] searchMovies failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async searchTVShows(query: string, page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb('/search/tv', { query, page }, { revalidateSeconds: 0 });
      const filtered = (data?.results ?? []).filter((s) => !!s.name && !!s.first_air_date);
      return { results: filtered, total_pages: data?.total_pages ?? 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] searchTVShows failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  // Details (cache longer)
  async getMovieDetails(id: number): Promise<MediaDetails | null> {
    try {
      const data = await fetchFromTmdb<MediaDetails>(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }, { revalidateSeconds: 86400 });
      return data ?? null;
    } catch (err: any) {
      console.warn('[tmdbApi] getMovieDetails failed:', err?.message ?? err);
      return null;
    }
  },

  async getTVShowDetails(id: number): Promise<MediaDetails | null> {
    try {
      const data = await fetchFromTmdb<MediaDetails>(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }, { revalidateSeconds: 86400 });
      return data ?? null;
    } catch (err: any) {
      console.warn('[tmdbApi] getTVShowDetails failed:', err?.message ?? err);
      return null;
    }
  },

  async getTVSeasonDetails(tvId: number, seasonNumber: number): Promise<any | null> {
    try {
      const data = await fetchFromTmdb(`/tv/${tvId}/season/${seasonNumber}`, { language: 'en-US' }, { revalidateSeconds: 86400 });
      return data ?? null;
    } catch (err: any) {
      console.warn(`[tmdbApi] getTVSeasonDetails failed for ${tvId} S${seasonNumber}:`, err?.message ?? err);
      return null;
    }
  },

  async getTVEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number): Promise<any | null> {
    try {
      const data = await fetchFromTmdb(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, { language: 'en-US' }, { revalidateSeconds: 86400 });
      return data ?? null;
    } catch (err: any) {
      console.warn(`[tmdbApi] getTVEpisodeDetails failed for ${tvId} S${seasonNumber}E${episodeNumber}:`, err?.message ?? err);
      return null;
    }
  },

  // Genres
  async getMovieGenres(): Promise<Genre[]> {
    try {
      const data = await fetchFromTmdb<{ genres: Genre[] }>(`/genre/movie/list`, {}, { revalidateSeconds: 86400 });
      return data?.genres ?? [];
    } catch (err: any) {
      console.warn('[tmdbApi] getMovieGenres failed:', err?.message ?? err);
      return [];
    }
  },

  async getTVGenres(): Promise<Genre[]> {
    try {
      const data = await fetchFromTmdb<{ genres: Genre[] }>(`/genre/tv/list`, {}, { revalidateSeconds: 86400 });
      return data?.genres ?? [];
    } catch (err: any) {
      console.warn('[tmdbApi] getTVGenres failed:', err?.message ?? err);
      return [];
    }
  },

  async getAllGenres(): Promise<{ movieGenres: Genre[]; tvGenres: Genre[] }> {
    try {
      const [movieGenres, tvGenres] = await Promise.all([this.getMovieGenres(), this.getTVGenres()]);
      return { movieGenres, tvGenres };
    } catch (err: any) {
      console.warn('[tmdbApi] getAllGenres failed:', err?.message ?? err);
      return { movieGenres: [], tvGenres: [] };
    }
  },

  async getMoviesByGenre(genreId: number, page = 1): Promise<{ results: Movie[]; total_pages: number }> {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/discover/movie`, { with_genres: genreId, page }, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] getMoviesByGenre failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async getTVShowsByGenre(genreId: number, page = 1): Promise<{ results: TVShow[]; total_pages: number }> {
    try {
      return await this.discoverTVShows({ page, genreId, sortBy: 'popularity.desc' });
    } catch (err: any) {
      console.warn('[tmdbApi] getTVShowsByGenre failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async discover(mediaType: 'movie' | 'tv', sortBy = 'popularity.desc', page = 1, genreId?: number): Promise<{ results: any[]; total_pages: number }> {
    try {
      const params: any = { sort_by: sortBy, page };
      if (genreId) params.with_genres = genreId;
      const data = await fetchFromTmdb(`/discover/${mediaType}`, params, { revalidateSeconds: 3600 });
      return data ?? { results: [], total_pages: 0 };
    } catch (err: any) {
      console.warn('[tmdbApi] discover failed:', err?.message ?? err);
      return { results: [], total_pages: 0 };
    }
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const data = await fetchFromTmdb('/configuration', {}, { revalidateSeconds: 86400 });
      if (data && (data as any).images) {
        return { success: true, message: 'Connected successfully to TMDB API' };
      }
      return { success: false, message: 'Unexpected response from TMDB configuration' };
    } catch (err: any) {
      return { success: false, message: err?.message ?? 'Unknown connection error' };
    }
  },

  // convenience
  async getDetails(id: number, type: 'movie' | 'tv'): Promise<MediaDetails | null> {
    return type === 'movie' ? this.getMovieDetails(id) : this.getTVShowDetails(id);
  },
};

export type { Movie, TVShow, Genre, MediaDetails };
export default tmdbApi;
