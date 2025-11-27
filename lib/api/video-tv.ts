// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

interface TVEmbedResult {
  embedUrl: string;
  provider: string;
}

function getTVProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_TV_EMBED_1 || "https://vidfast.to/embed/tv/${id}/${season}/${episode}",
    process.env.NEXT_PUBLIC_TV_EMBED_2 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_3 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_4 || "",
    process.env.NEXT_PUBLIC_TV_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://vidfast.to/embed/tv/${id}/${season}/${episode}"];
}

// ✅ FIXED: Added missing season and episode parameters
export function getTVEmbed(
  id: string | number, 
  season: number = 1, 
  episode: number = 1
): TVEmbedResult {
  const providers = getTVProviders();
  const providerUrl = providers[0];

  // Direct template replacement - instant
  const embedUrl = providerUrl
    .replace(/\$\{id\}/g, String(id))
    .replace(/\$\{season\}/g, String(season))
    .replace(/\$\{episode\}/g, String(episode));

  return {
    embedUrl,
    provider: getServerLabel(providerUrl)
  };
}

export default { getTVEmbed };
