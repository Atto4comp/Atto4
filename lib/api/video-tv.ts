// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://api.cinezo.net/media/tmdb-tv-${id}/${season}/${episode}", label: "Cinezo" },
  { url: "https://www.vidking.net/embed/tv/${id}/${season}/${episode}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true", label: "Vidme" },
  { url: "https://bidsrc.pro/tv/${id}/${season}/${episode}?autoplay=true", label: "Vidzy" },
  { url: "https://fmovies4u.io/embed/tmdb-tv-${id}/${season}/${episode}?theme=16A085&hideServer=true&autoPlay=true&sub=en&nextButton=true&autoNext=true&title=false", label: "Vidly" }
  
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
