import { getServerLabel } from './video-common';

interface TVEmbedResult {
  embedUrl: string;
  provider: string;
}

function getTVProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_TV_EMBED_1 || "https://player.vidplus.to/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&download=true&watchparty=true&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&primarycolor=FF0000&secondarycolor=9F9BFF&iconcolor=FFFFFF",
    process.env.NEXT_PUBLIC_TV_EMBED_2 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_3 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_4 || "",
    process.env.NEXT_PUBLIC_TV_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://player.vidplus.to/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&download=true&watchparty=true&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&primarycolor=FF0000&secondarycolor=9F9BFF&iconcolor=FFFFFF"];
}

// ✅ FAST: Direct URL building - no validation overhead
export function getTVEmbed(id: string | number): TVEmbedResult {
  const providers = getTVProviders();
  const providerUrl = providers[0];

  // Direct template replacement - instant
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
