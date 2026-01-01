// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔓 DIRECT LINKS (No Encryption)
const SERVERS = [
  { 
    id: 'vidzy', 
    label: 'Vidzy', 
    baseUrl: "https://bidsrc.pro/tv/"
  },
  { 
    id: 'vidly', 
    label: 'Vidly', 
    baseUrl: "https://fmovies4u.com/embed/tmdb-tv-"
  },
  { 
    id: 'vidme', 
    label: 'Vidme', 
    baseUrl: "https://www.vidking.net/embed/tv/"
  }
];

// ⚙️ Configs (Suffixes with placeholders)
const CONFIGS: Record<string, string> = {
  vidly: "/${season}/${episode}?autoPlay=true",
  bidsrc: "/${season}/${episode}",
  vidlink: "/${season}/${episode}",
  vidme: "/${season}/${episode}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "/${season}/${episode}?autoplay=1",
};

export function getTVEmbed(id: string | number, season: number = 1, episode: number = 1): TVEmbedResult {
  const sources = SERVERS.map(s => {
    // 1. Get Suffix Template
    const suffixTemplate = CONFIGS[s.id] || "/${season}/${episode}";
    
    // 2. Replace placeholders
    const filledSuffix = suffixTemplate
      .replace(/\$\{season\}/g, String(season))
      .replace(/\$\{episode\}/g, String(episode));

    // 3. Construct URL
    const fullUrl = `${s.baseUrl}${id}${filledSuffix}`;

    return {
      url: fullUrl,
      label: s.label,
      isEncrypted: false // Flag updated
    };
  });

  return {
    embedUrl: "",
    provider: "Direct",
    allSources: sources as any
  };
}

export default { getTVEmbed };
