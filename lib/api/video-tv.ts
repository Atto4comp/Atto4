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

// ✅ Uses actual season/episode parameters instead of defaulting
export function getTVEmbed(
  id: string | number, 
  season: string | number, 
  episode: string | number
): TVEmbedResult {
  const providers = getTVProviders();
  const providerUrl = providers[0];

  // Use the actual parameters passed to the function
  const embedUrl = providerUrl
    .replace(/\$\{id\}/g, String(id))
    .replace(/\$\{season\}/g, '1')
    .replace(/\$\{episode\}/g, '1');

  return {
    embedUrl,
    provider: getServerLabel(providerUrl)
  };
}

export default { getTVEmbed };

