// lib/api/video-common.ts

/**
 * Video Common Utilities for SSG/ISR
 * 
 * Provides instant ID resolution, embed URL building, and caching
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
  if (typeof id === 'number') {
    return id;
  }
  
  const strId = String(id).trim();
  
  // ✅ INSTANT: Cached lookups (from previous resolutions)
  if (tmdbCache.has(strId)) {
    return tmdbCache.get(strId)!;
  }
  
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
        {
          next: { revalidate: 86400 } // Cache IMDb lookups for 24 hours
        }
      );
      
      if (!res.ok) {
        console.error(`[video-common] TMDB API error: ${res.status}`);
        return null;
      }
      
      const data = await res.json();
      const results = type === 'movie' ? data.movie_results : data.tv_results;
      
      if (results && results.length > 0 && results[0].id) {
        const tmdbId = results[0].id;
        tmdbCache.set(strId, tmdbId);
        console.log(`[video-common] Resolved IMDb ID ${strId} → TMDB ${tmdbId}`);
        return tmdbId;
      }
      
      console.warn(`[video-common] No ${type} found for IMDb ID: ${strId}`);
      return null;
    } catch (error) {
      console.error('[video-common] Failed to resolve IMDb ID:', error);
      return null;
    }
  }
  
  // Invalid format
  console.warn(`[video-common] Invalid ID format: ${strId}`);
  return null;
}

/**
 * Builds embed URL from provider template
 * Supports ${id}, ${type}, ${season}, ${episode} placeholders
 * 
 * @param provider - Provider URL template (e.g., "https://example.com/embed/${type}/${id}")
 * @param mediaType - Media type ('movie' or 'tv')
 * @param id - TMDB numeric ID
 * @param season - Season number (for TV shows)
 * @param episode - Episode number (for TV shows)
 * @returns Complete embed URL
 */
export function buildEmbedUrl(
  provider: string, 
  mediaType: 'movie' | 'tv', 
  id: number, 
  season = 1, 
  episode = 1
): string {
  if (!provider || !provider.trim()) {
    throw new Error('[video-common] No provider URL specified');
  }
  
  if (!id || id <= 0) {
    throw new Error('[video-common] Invalid media ID');
  }
  
  // ✅ INSTANT: Template variable replacement
  let url = provider
    .replace(/\$\{id\}/g, String(id))
    .replace(/\$\{type\}/g, mediaType)
    .replace(/\$\{season\}/g, String(season))
    .replace(/\$\{episode\}/g, String(episode));
  
  // ✅ INSTANT: Path building for non-template URLs
  // If no template variables found, build path manually
  if (!/\$\{/.test(provider)) {
    const base = provider.endsWith('/') ? provider.slice(0, -1) : provider;
    url = mediaType === 'movie' 
      ? `${base}/movie/${id}`
      : `${base}/tv/${id}/${season}/${episode}`;
  }
  
  // Validate final URL
  try {
    new URL(url);
  } catch {
    throw new Error(`[video-common] Invalid embed URL generated: ${url}`);
  }
  
  return url;
}

/**
 * Extracts server label from URL for display purposes
 * 
 * @param url - Full URL or template
 * @returns Clean hostname (e.g., "example.com")
 */
export function getServerLabel(url: string): string {
  if (!url) return 'Unknown Server';
  
  try {
    // Try parsing as full URL
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '').replace(/\.com$/, '');
  } catch {
    // If not a valid URL, extract from template
    const match = url.match(/https?:\/\/([^/]+)/);
    if (match && match[1]) {
      return match[1].replace(/^www\./, '').replace(/\.com$/, '');
    }
    return 'Video Server';
  }
}

/**
 * Validates if a provider URL is properly formatted
 * 
 * @param provider - Provider URL or template
 * @returns true if valid, false otherwise
 */
export function isValidProvider(provider: string): boolean {
  if (!provider || typeof provider !== 'string') {
    return false;
  }
  
  const trimmed = provider.trim();
  
  // Must start with http:// or https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return false;
  }
  
  // Must have a domain
  if (!/https?:\/\/[^/]+/.test(trimmed)) {
    return false;
  }
  
  return true;
}

/**
 * Gets the first valid provider from a list
 * 
 * @param providers - Array of provider URLs
 * @returns First valid provider or null
 */
export function getFirstValidProvider(providers: string[]): string | null {
  if (!Array.isArray(providers) || providers.length === 0) {
    return null;
  }
  
  for (const provider of providers) {
    if (isValidProvider(provider)) {
      return provider;
    }
  }
  
  return null;
}

/**
 * Clears the TMDB ID cache (useful for testing or memory management)
 */
export function clearCache(): void {
  tmdbCache.clear();
  console.log('[video-common] Cache cleared');
}

/**
 * Gets cache statistics (useful for debugging)
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: tmdbCache.size,
    keys: Array.from(tmdbCache.keys())
  };
}

/**
 * Sanitizes embed URL for security
 * Removes potentially dangerous parameters
 * 
 * @param url - Embed URL to sanitize
 * @returns Sanitized URL
 */
export function sanitizeEmbedUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove dangerous query parameters
    const dangerousParams = ['javascript', 'data', 'vbscript', 'file'];
    dangerousParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Type definitions for video common utilities
 */
export interface EmbedResult {
  embedUrl: string;
  provider: string;
  mediaType: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
}

/**
 * Creates a complete embed result object
 * 
 * @param provider - Provider URL
 * @param mediaType - Media type
 * @param id - TMDB ID
 * @param season - Season number (optional)
 * @param episode - Episode number (optional)
 * @returns Complete embed result
 */
export function createEmbedResult(
  provider: string,
  mediaType: 'movie' | 'tv',
  id: number,
  season?: number,
  episode?: number
): EmbedResult {
  const embedUrl = season && episode
    ? buildEmbedUrl(provider, mediaType, id, season, episode)
    : buildEmbedUrl(provider, mediaType, id);
  
  return {
    embedUrl: sanitizeEmbedUrl(embedUrl),
    provider: getServerLabel(provider),
    mediaType,
    id,
    ...(season && { season }),
    ...(episode && { episode })
  };
}

// Export types
export type { EmbedResult };

// Export all functions as default object
export default {
  resolveTmdbId,
  buildEmbedUrl,
  getServerLabel,
  isValidProvider,
  getFirstValidProvider,
  clearCache,
  getCacheStats,
  sanitizeEmbedUrl,
  createEmbedResult
};
