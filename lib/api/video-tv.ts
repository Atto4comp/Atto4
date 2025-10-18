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

// ✅ Return a masked, first-party embed route instead of the third-party URL
export function getTVEmbed(
  id: string | number,
  season: string | number,
  episode: string | number
): TVEmbedResult {
  const providers = getTVProviders();
  const providerUrl = providers[0];

  // We no longer return the 3P URL here — the player loads our own route
  const embedUrl = `/api/embed/tv?mid=${encodeURIComponent(String(id))}&s=${encodeURIComponent(String(season))}&e=${encodeURIComponent(String(episode))}`;

  return {
    embedUrl,
    provider: getServerLabel(providerUrl)
  };
}

export default { getTVEmbed };
