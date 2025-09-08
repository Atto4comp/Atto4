// In-memory cache for instant ID lookups
const tmdbCache = new Map<string, number>();

export async function resolveTmdbId(id: string | number, type: 'movie' | 'tv'): Promise<number | null> {
  // ✅ INSTANT: Numeric IDs
  if (typeof id === 'number') return id;
  
  const strId = String(id);
  
  // ✅ INSTANT: Cached lookups  
  if (tmdbCache.has(strId)) return tmdbCache.get(strId)!;
  
  // ✅ INSTANT: String numbers
  const num = Number(strId);
  if (!isNaN(num) && isFinite(num)) {
    tmdbCache.set(strId, num);
    return num;
  }
  
  // ✅ FAST: IMDb IDs (only when needed)
  if (/^tt\d+$/i.test(strId)) {
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!key) return null;
    
    try {
      const res = await fetch(`https://api.themoviedb.org/3/find/${strId}?api_key=${key}&external_source=imdb_id`, {
        next: { revalidate: 86400 } // Cache 24h
      });
      const data = await res.json();
      const results = type === 'movie' ? data.movie_results : data.tv_results;
      
      if (results?.[0]?.id) {
        tmdbCache.set(strId, results[0].id);
        return results[0].id;
      }
    } catch {
      return null;
    }
  }
  
  return null;
}

export function buildEmbedUrl(
  provider: string, 
  mediaType: 'movie' | 'tv', 
  id: number, 
  season = 1, 
  episode = 1
): string {
  if (!provider) throw new Error('No provider');
  
  // ✅ INSTANT: Template replacement
  let url = provider
    .replace(/\$\{id\}/g, String(id))
    .replace(/\$\{type\}/g, mediaType)
    .replace(/\$\{season\}/g, String(season))
    .replace(/\$\{episode\}/g, String(episode));
  
  // ✅ INSTANT: Path building for non-templates
  if (!/\$\{/.test(provider)) {
    const base = provider.endsWith('/') ? provider.slice(0, -1) : provider;
    url = mediaType === 'movie' 
      ? `${base}/movie/${id}`
      : `${base}/tv/${id}/${season}/${episode}`;
  }
  
  return url;
}

export function getServerLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}
