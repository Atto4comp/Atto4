// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔓 DIRECT LINKS (No Encryption)
const SERVERS = [  
  { 
    id: 'vidme', 
    label: 'Vidme', 
    baseUrl: "https://www.vidking.net/embed/movie/"
  },
  { 
    id: 'vidzy', 
    label: 'Vidzy', 
    baseUrl: "https://bidsrc.pro/movie/"
  },
  { 
    id: 'vidly', 
    label: 'Vidly', 
    baseUrl: "https://fmovies4u.com/embed/tmdb-movie-"
  }
];

// ⚙️ Configs (Suffixes)
const CONFIGS: Record<string, string> = {
  vidly: "?autoPlay=true", // Result: .../tmdb-movie-123?autoPlay=false
  bidsrc: "",               // Result: .../movie/123
  vidlink: "",              // Result: .../movie/123
  vidme: "?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "?autoplay=1",
};

export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const sources = SERVERS.map(s => {
    // Construct the full URL directly
    const fullUrl = `${s.baseUrl}${id}${CONFIGS[s.id] || ""}`;
    
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

export default { getMovieEmbed };
