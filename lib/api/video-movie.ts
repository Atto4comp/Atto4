import { getServerLabel } from './video-common';

interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
}

function getMovieProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_MOVIE_EMBED_1 || "https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&&backlink=https://atto4.pro/",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_2 || "",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_3 || "",
    process.env.NEXT_PUBLIC_MOVIE_EMBED_4 || "",
    process.env.NEXT_PUBLIC_MOVIE_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&&backlink=https://atto4.pro/"];
}

// ✅ Return a masked, first-party embed route instead of the third-party URL
export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const providers = getMovieProviders();
  const providerUrl = providers[0];

  // We no longer return the 3P URL here — the player loads our own route
  const embedUrl = `/api/embed/movie?mid=${encodeURIComponent(String(id))}`;

  return {
    embedUrl,
    provider: getServerLabel(providerUrl)
  };
}

export default { getMovieEmbed };
