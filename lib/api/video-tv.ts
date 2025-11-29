// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://fmovies4u.com/embed/tmdb-tv-${id}/${season}/${episode}", label: "Vidly" },
  { url: "https://vidfast.to/embed/tv/${id}/${season}/${episode}", label: "Vidzy" },
  { url: "https://vidfast.to/embed/tv/${id}/${season}/${episode}", label: "Vidme" }
  
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
