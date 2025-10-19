import { getServerLabel } from './video-common';

interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
}

function getMovieProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_MOVIE_EMBED_1 || "https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_2 || "",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_3 || "",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_4 || "",
    process.env.NEXT_PUBLIC_MOVIE_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&backlink=https://atto4.pro/"];
}

/**
 * Get movie embed URL using browser proxy
 * @param id - TMDB movie ID
 * @returns Embed URL and provider info
 */
export function getMovieEmbed(id: string | number): MovieEmbedResult {
  // Get configured providers (kept for future extensibility)
  const providers = getMovieProviders();
  const providerUrl = providers[0];
  const providerLabel = getServerLabel(providerUrl);

  // Use internal browser proxy route
  // This bypasses Cloudflare 403 errors using Puppeteer with stealth plugin
  const embedUrl = `/embed/movie/${id}`;

  return {
    embedUrl,
    provider: `Browser Proxy (${providerLabel})`
  };
}

export default { getMovieEmbed };
