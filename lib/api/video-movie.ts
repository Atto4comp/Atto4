// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://fmovies4u.com/embed/tmdb-movie-${id}?autoPlay=true&hideTitle=true", label: "Vidly" },
  { url: "https://api.cinezo.net/media/tmdb-movie-${id}", label: "Cinezo" },
  { url: "https://www.vidking.net/embed/movie/${id}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true", label: "vidme" },
  { url: "https://bidsrc.pro/movie/${id}?autoplay=true", label: "vidzy" },
  { url: "https://player.vidplus.to/embed/movie/${id}?autoplay=true&poster=true&title=true&watchparty=false&chromecast=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5", label: "vidon" }
    
];

export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const sources = PROVIDERS.map(p => ({
    url: p.url.replace(/\$\{id\}/g, String(id)),
    label: p.label
  }));

  // Default to first source
  return {
    embedUrl: sources[0].url,
    provider: sources[0].label,
    allSources: sources
  };
}

export default { getMovieEmbed };
