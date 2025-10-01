import { getServerLabel } from './video-common';

interface TVEmbedResult {
  embedUrl: string;
  provider: string;
}

function getTVProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_TV_EMBED_1 || "https://player.vidplus.to/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&watchparty=false&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5",
    process.env.NEXT_PUBLIC_TV_EMBED_2 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_3 || "",
    process.env.NEXT_PUBLIC_TV_EMBED_4 || "",
    process.env.NEXT_PUBLIC_TV_API_BASE || "",
  ].filter(p => p.trim());
  
  return providers.length > 0 ? providers : ["https://player.vidplus.to/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&watchparty=false&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5"];
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
