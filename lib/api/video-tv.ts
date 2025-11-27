// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=${backlink}", label: "Atto4" },
  { url: "https://vidfast.to/embed/tv/${id}/${season}/${episode}", label: "Vidme" },
  { url: "https://player.vidplus.to/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&watchparty=false&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5", label: "Vidly" }
];

export function getTVEmbed(id: string | number, season: number = 1, episode: number = 1): TVEmbedResult {
  const sources = PROVIDERS.map(p => ({
    url: p.url
      .replace(/\$\{id\}/g, String(id))
      .replace(/\$\{season\}/g, String(season))
      .replace(/\$\{episode\}/g, String(episode)),
    label: p.label
  }));

  return {
    embedUrl: sources[0].url,
    provider: sources[0].label,
    allSources: sources
  };
}

export default { getTVEmbed };
