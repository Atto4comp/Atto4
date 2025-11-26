// lib/api/tmdb.ts
import type { Movie, TVShow, Genre, MediaDetails } from './types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = (process.env.NEXT_PUBLIC_TMDB_API_KEY || '').trim();

if (!API_KEY) {
  // non-fatal: warn so devs notice missing key early
  // keeping NEXT_PUBLIC_ here matches existing codebase usage (public read-only key).
  // If you prefer a server-only key, move to NEXT_TMDB_API_KEY and update usage.
  // eslint-disable-next-line no-console
  console.warn('[tmdb] WARNING: NEXT_PUBLIC_TMDB_API_KEY is not set. TMDB requests will fail until provided.');
}

/**
 * Helper that performs a fetch to TMDB with retries, structured errors, and
 * Next.js cache/revalidate integration via the `next` option.
 *
 * By default this function sets revalidateSeconds = 3600 (1h) which is
 * appropriate for list endpoints. Callers may override per-endpoint.
 */
async function fetchFromTmdb<T = any>(
  path: string,
  params: Record<string, any> = {},
  opts?: { revalidateSeconds?: number; maxRetries?: number }
): Promise<T> {
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
        // allow Next.js to use ISR when rendered on server components:
        // pages/components calling these helpers should be server components
        // to leverage the `next` option. Client-side fetches (browser) will ignore it.
        next: { revalidate: revalidateSeconds },
        headers: {
          Accept: 'application/json',
        },
      });

      if (res.status === 404) {
        const msg = `TMDB 404: resource not found (${path})`;
        const e: any = new Error(msg);
        e.status = 404;
        throw e;
      }

      if (res.status === 401) {
        const msg = `TMDB 401: Invalid or unauthorized API key for (${path})`;
        const e: any = new Error(msg);
        e.status = 401;
        throw e;
      }

      if (!res.ok) {
        // for 5xx or other transient errors we retry
        const bodyText = await safeReadBody(res);
        const err = new Error(`TMDB request failed (${path}) status=${res.status} ${res.statusText} body=${bodyText}`);
        (err as any).status = res.status;
        throw err;
      }

      const json = (await res.json()) as T;
      return json;
    } catch (err: any) {
      lastErr = err;
      const isNetworkError =
        err?.code === 'ENOTFOUND' ||
        err?.code === 'ECONNABORTED' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'ETIMEDOUT' ||
        // fetch throws TypeError for network failures in some runtimes
        err instanceof TypeError;

      const isLastAttempt = attempt >= maxRetries;

      if (err?.status === 404 || err?.status === 401) {
        // don't retry on 4xx that indicate a bad request or authentication
        throw err;
      }

      if (isLastAttempt) {
        // attach some context for easier debugging
        const message = err?.message ? String(err.message) : 'Unknown error';
        const out = new Error(`TMDB request failed (${path}): ${message}`);
        (out as any).original = err;
        throw out;
      }

      // exponential backoff
      const backoffMs = Math.pow(2, attempt - 1) * 500;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, backoffMs));
      // loop will retry
    }
  }

  // If we somehow escape the loop, throw last error
  throw lastErr || new Error('Unknown TMDB fetch error');
}

async function safeReadBody(res: Response): Promise<string> {
  try {
    const txt = await res.text();
    return txt.slice(0, 400);
  } catch {
    return '';
  }
}

/**
 * Public API surface. Each method uses fetchFromTmdb under the hood.
 *
 * Important notes for ISR behavior:
 * - Server components that import and call these methods will use Next's
 *   caching & ISR via the `next: { revalidate }` option above.
 * - Client-side usage (in browser code) will ignore Next's `next` option and
 *   perform a normal browser fetch (no ISR). For search/infinite-scroll make
 *   sure to call these from the client or conversely call TMDB directly from client code.
 */
export const tmdbApi = {
  async getTrending(timeWindow: 'day' | 'week' = 'week') {
    try {
      const data = await fetchFromTmdb<{ results: Movie[] }>(`/trending/movie/${timeWindow}`, {}, { revalidateSeconds: 3600 });
      return data.results || [];
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTrending failed:', error?.message ?? error);
      return [];
    }
  },

  async getTVTrending(timeWindow: 'day' | 'week' = 'week') {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[] }>(`/trending/tv/${timeWindow}`, {}, { revalidateSeconds: 3600 });
      return data.results || [];
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTVTrending failed:', error?.message ?? error);
      return [];
    }
  },

  async getPopularMovies(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/popular`, { page }, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getPopularMovies failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getTopRatedMovies(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/top_rated`, { page }, { revalidateSeconds: 86400 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTopRatedMovies failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getUpcomingMovies(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/upcoming`, { page }, { revalidateSeconds: 86400 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getUpcomingMovies failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getNowPlayingMovies(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/movie/now_playing`, { page }, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getNowPlayingMovies failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getPopularTVShows(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/popular`, { page }, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getPopularTVShows failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getTopRatedTVShows(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/top_rated`, { page }, { revalidateSeconds: 86400 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTopRatedTVShows failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getOnTheAirTVShows(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/on_the_air`, { page }, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getOnTheAirTVShows failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getAiringTodayTVShows(page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/tv/airing_today`, { page }, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getAiringTodayTVShows failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getTVByCategory(category: string, page: number = 1) {
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
      const filteredResults = (data.results || []).filter((item) => !!item.name && !!item.first_air_date);
      return { results: filteredResults, total_pages: data.total_pages || 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTVByCategory failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async discoverTVShows(params: {
    page?: number;
    genreId?: number;
    sortBy?: string;
    year?: number;
    minRating?: number;
  } = {}) {
    try {
      const requestParams: any = {
        page: params.page || 1,
        sort_by: params.sortBy || 'popularity.desc',
        'vote_count.gte': 10,
      };
      if (params.genreId) requestParams.with_genres = params.genreId;
      if (params.year) requestParams.first_air_date_year = params.year;
      if (params.minRating) requestParams['vote_average.gte'] = params.minRating;

      const data = await fetchFromTmdb<{ results: TVShow[]; total_pages: number }>(`/discover/tv`, requestParams, { revalidateSeconds: 3600 });
      const filteredResults = (data.results || []).filter((show) => !!show.name && !!show.first_air_date);
      return { results: filteredResults, total_pages: data.total_pages || 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] discoverTVShows failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getLatestReleases(mediaType: 'movie' | 'tv' = 'movie', page: number = 1, genreId?: number) {
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
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getLatestReleases failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async searchMulti(query: string, params?: { page?: number }) {
    try {
      // Search endpoints should typically be performed client-side (no ISR),
      // but we still provide this with revalidateSeconds=0 so server won't cache it.
      const data = await fetchFromTmdb('/search/multi', { query, ...(params || {}) }, { revalidateSeconds: 0 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] searchMulti failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async searchMovies(query: string, page: number = 1) {
    try {
      const data = await fetchFromTmdb('/search/movie', { query, page }, { revalidateSeconds: 0 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] searchMovies failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async searchTVShows(query: string, page: number = 1) {
    try {
      const data = await fetchFromTmdb('/search/tv', { query, page }, { revalidateSeconds: 0 });
      const filteredResults = (data.results || []).filter((show) => !!show.name && !!show.first_air_date);
      return { results: filteredResults, total_pages: data.total_pages || 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] searchTVShows failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getMovieDetails(id: number) {
    try {
      const data = await fetchFromTmdb<MediaDetails>(`/movie/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }, { revalidateSeconds: 86400 });
      return data || null;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getMovieDetails failed:', error?.message ?? error);
      return null;
    }
  },

  async getTVShowDetails(id: number) {
    try {
      const data = await fetchFromTmdb<MediaDetails>(`/tv/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }, { revalidateSeconds: 86400 });
      return data || null;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTVShowDetails failed:', error?.message ?? error);
      return null;
    }
  },

  async getTVSeasonDetails(tvId: number, seasonNumber: number) {
    try {
      const data = await fetchFromTmdb(`/tv/${tvId}/season/${seasonNumber}`, { language: 'en-US' }, { revalidateSeconds: 86400 });
      return data || null;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn(`[tmdbApi] getTVSeasonDetails failed for TV ${tvId} season ${seasonNumber}:`, error?.message ?? error);
      return null;
    }
  },

  async getTVEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number) {
    try {
      const data = await fetchFromTmdb(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, { language: 'en-US' }, { revalidateSeconds: 86400 });
      return data || null;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn(`[tmdbApi] getTVEpisodeDetails failed for TV ${tvId} S${seasonNumber}E${episodeNumber}:`, error?.message ?? error);
      return null;
    }
  },

  async getMovieGenres() {
    try {
      const data = await fetchFromTmdb<{ genres: Genre[] }>(`/genre/movie/list`, {}, { revalidateSeconds: 86400 });
      return data.genres || [];
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getMovieGenres failed:', error?.message ?? error);
      return [];
    }
  },

  async getTVGenres() {
    try {
      const data = await fetchFromTmdb<{ genres: Genre[] }>(`/genre/tv/list`, {}, { revalidateSeconds: 86400 });
      return data.genres || [];
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTVGenres failed:', error?.message ?? error);
      return [];
    }
  },

  async getAllGenres() {
    try {
      const [movieGenres, tvGenres] = await Promise.all([this.getMovieGenres(), this.getTVGenres()]);
      return { movieGenres, tvGenres };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getAllGenres failed:', error?.message ?? error);
      return { movieGenres: [], tvGenres: [] };
    }
  },

  async getMoviesByGenre(genreId: number, page: number = 1) {
    try {
      const data = await fetchFromTmdb<{ results: Movie[]; total_pages: number }>(`/discover/movie`, { with_genres: genreId, page }, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getMoviesByGenre failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async getTVShowsByGenre(genreId: number, page: number = 1) {
    try {
      return await this.discoverTVShows({ page, genreId, sortBy: 'popularity.desc' });
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] getTVShowsByGenre failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async discover(mediaType: 'movie' | 'tv', sortBy = 'popularity.desc', page = 1, genreId?: number) {
    try {
      const params: any = { sort_by: sortBy, page };
      if (genreId) params.with_genres = genreId;
      const data = await fetchFromTmdb(`/discover/${mediaType}`, params, { revalidateSeconds: 3600 });
      return data || { results: [], total_pages: 0 };
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn('[tmdbApi] discover failed:', error?.message ?? error);
      return { results: [], total_pages: 0 };
    }
  },

  async testConnection() {
    try {
      const data = await fetchFromTmdb('/configuration', {}, { revalidateSeconds: 86400 });
      if (data && (data as any).images) {
        return { success: true, message: 'Connected successfully to TMDB API' };
      }
      return { success: false, message: 'Unexpected response from TMDB configuration' };
    } catch (error: any) {
      return { success: false, message: error?.message ?? 'Unknown connection error' };
    }
  },

  async getDetails(id: number, type: 'movie' | 'tv') {
    return type === 'movie' ? this.getMovieDetails(id) : this.getTVShowDetails(id);
  },
};

export type { Movie, TVShow, Genre, MediaDetails };
