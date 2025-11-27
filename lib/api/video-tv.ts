// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

const PROVIDERS = [
  { url: "https://vidsrc.to/embed/tv/${id}/${season}/${episode}", label: "VidSrc To" },
  { url: "https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}", label: "VidSrc Me" },
  { url: "https://vidbinge.com/embed/tv/${id}/${season}/${episode}", label: "VidBinge" },
  { url: "https://www.2embed.cc/embed/${id}&s=${season}&e=${episode}", label: "2Embed" },
  { url: "https://superembed.stream/embed/tv/${id}/${season}/${episode}", label: "SuperEmbed" }
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
