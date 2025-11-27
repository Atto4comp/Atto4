// lib/api/video-common.ts

/**
 * Video Common Utilities for SSG/ISR
 * 
 * Provides ID resolution, provider management, and secure URL building
 * for movie and TV show video players.
 */

// ✅ In-memory cache for instant ID lookups (persists during runtime)
const tmdbCache = new Map<string, number>();

/**
 * Resolves TMDB ID from various formats (number, string, IMDb ID)
 * Prioritizes instant resolution, only hits API for IMDb IDs
 * 
 * @param id - TMDB ID or IMDb ID (e.g., 550 or "tt0137523")
 * @param type - Media type ('movie' or 'tv')
 * @returns TMDB numeric ID or null if not found
 */
export async function resolveTmdbId(
  id: string | number, 
  type: 'movie' | 'tv'
): Promise<number | null> {
  // ✅ INSTANT: Already a number
  if (typeof id === 'number') return id;
  
  const strId = String(id).trim();
  
  // ✅ INSTANT: Cached lookups
  if (tmdbCache.has(strId)) return tmdbCache.get(strId)!;
  
  // ✅ INSTANT: String that's actually a number
  const num = Number(strId);
  if (!isNaN(num) && isFinite(num) && num > 0) {
    tmdbCache.set(strId, num);
    return num;
  }
  
  // ✅ FAST: IMDb IDs (e.g., "tt0137523") - Only hits API when needed
  if (/^tt\d+$/i.test(strId)) {
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!key) {
      console.warn('[video-common] TMDB API key not configured, cannot resolve IMDb ID');
      return null;
    }
    
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/find/${strId}?api_key=${key}&external_source=imdb_id`,
        { next: { revalidate: 86400 } }
      );
      
      if (!res.ok) return null;
      
      const data = await res.json();
      const results = type === 'movie' ? data.movie_results : data.tv_results;
      
      if (results && results.length > 0 && results[0].id) {
        const tmdbId = results[0].id;
        tmdbCache.set(strId, tmdbId);
        return tmdbId;
      }
      return null;
    } catch (error) {
      console.error('[video-common] Failed to resolve IMDb ID:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Extracts clean server label from URL
 * e.g. "https://vidsrc.to/..." -> "VidSrc"
 */
export function getServerLabel(url: string): string {
  if (!url) return 'Unknown Server';
  try {
    const hostname = new URL(url).hostname;
    const label = hostname.replace(/^www\./, '').split('.')[0];
    // Capitalize first letter
    return label.charAt(0).toUpperCase() + label.slice(1);
  } catch {
    return 'Server';
  }
}

/**
 * Validates provider URL format
 */
export function isValidProvider(provider: string): boolean {
  if (!provider || typeof provider !== 'string') return false;
  const trimmed = provider.trim();
  return /^https?:\/\/[^/]+/.test(trimmed);
}

/**
 * Sanitizes embed URL for security
 */
export function sanitizeEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const dangerousParams = ['javascript', 'data', 'vbscript', 'file'];
    dangerousParams.forEach(param => urlObj.searchParams.delete(param));
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Type definitions
 */
export interface EmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

export default {
  resolveTmdbId,
  getServerLabel,
  isValidProvider,
  sanitizeEmbedUrl
};
