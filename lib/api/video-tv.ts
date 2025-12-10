// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://fmovies4u.com/embed/tmdb-tv-${id}/${season}/${episode}?autoPlay=true&hideTitle=true", label: "Vidly" },
  { url: "https://api.cinezo.net/media/tmdb-tv-${id}/${season}/${episode}", label: "Cinezo" },
  { url: "https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true", label: "Vidme" },
  { url: "https://bidsrc.pro/tv/${id}/${season}/${episode}?autoplay=true", label: "Vidzy" },
  { url: "https://player.vidplus.to/embed/tv/${id}/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&watchparty=false&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5", label: "Vidon" }
  
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
