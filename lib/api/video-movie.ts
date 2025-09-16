import { getServerLabel } from './video-common';

interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
}

function getMovieProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_MOVIE_EMBED_1 || "https://vidnest.fun/movie/${id}",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_2 || "",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_3 || "",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_4 || "",
    process.env.NEXT_PUBLIC_MOVIE_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://vidnest.fun/movie/${id}"];
}

// ✅ FAST: Direct URL building - no validation overhead
export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const providers = getMovieProviders();
  const providerUrl = providers[0];

  // Direct template replacement - instant
  const embedUrl = providerUrl.replace(/\$\{id\}/g, String(id));

  return {
    embedUrl,
    provider: getServerLabel(providerUrl)
  };
}

export default { getMovieEmbed };
