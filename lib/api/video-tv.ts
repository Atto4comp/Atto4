import { getServerLabel } from './video-common';

interface TVEmbedResult {
  embedUrl: string;
  provider: string;
}

function getTVProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_TV_EMBED_1 || "https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/",
    process.env.NEXT_PUBLIC_TV_EMBED_2 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_3 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_4 || "",
    process.env.NEXT_PUBLIC_TV_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/"];
}

/**
 * Get TV show embed URL using browser proxy
 * @param id - TMDB TV show ID
 * @param season - Season number
 * @param episode - Episode number
 * @returns Embed URL and provider info
 */
export function getTVEmbed(
  id: string | number, 
  season: string | number, 
  episode: string | number
): TVEmbedResult {
  // Get configured providers (kept for future extensibility)
  const providers = getTVProviders();
  const providerUrl = providers[0];
  const providerLabel = getServerLabel(providerUrl);

  // Use internal browser proxy route
  // This bypasses Cloudflare 403 errors using Puppeteer with stealth plugin
  const embedUrl = `/embed/tv/${id}/${season}/${episode}`;

  return {
    embedUrl,
    provider: `Browser Proxy (${providerLabel})`
  };
}

export default { getTVEmbed };

