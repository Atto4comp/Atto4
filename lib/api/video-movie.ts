// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔐 CORRECTED ENCRYPTED KEYS
// Format: Base64 of the REVERSED string of the base URL
const SERVERS = [
   { 
    id: 'vidme', 
    label: 'Vidme', 
    // "https://www.vidking.net/embed/movie/"
    key: "L2Vpdm9tL2RlYm1lL3Rlbi5nbmlrZGl2Lnd3dy8vOnNwdHRo" 
  },
  { 
    id: 'vidly', 
    label: 'Vidly', 
    // "https://fmovies4u.com/embed/tmdb-movie-"
    key: "LWVpdm9tLWJkbXQvZWJtZWQvbW9jLnU0c2Vpdm9tZi8vOnNwdHRo" 
  },
  { 
    id: 'bidsrc', 
    label: 'BidSrc', 
    // "https://bidsrc.pro/movie/"
    key: "L2Vpdm9tL29ycC5jcnNkaWIvLzpwYXR0aA==" 
  },
  {
    id: 'vidzy',
    label: 'Vidzy',
    // "https://player.vidzee.wtf/embed/movie/"
    key: "L2Vpdm9tL2RlYm1lL2Z0dy5lZXpkaXYucmV5YWxwLy86c3B0dGg="
  }
];

// ⚙️ Configs (Suffixes)
const CONFIGS: Record<string, string> = {
  vidfast: "", // No suffix needed, just ID
  bidsrc: "",  // No suffix needed, just ID
  fmovies4u: "?autoPlay=false", // Append params after ID
  vidly: "?autoPlay=true&hideTitle=true",
  cinezo: "",
  vidme: "?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "?autoplay=true",
};

export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const sources = SERVERS.map(s => ({
    encryptedKey: s.key,
    suffix: CONFIGS[s.id] || "",
    mediaId: id,
    label: s.label,
    isEncrypted: true
  }));

  return {
    embedUrl: "",
    provider: "Obfuscated",
    allSources: sources as any
  };
}

export default { getMovieEmbed };
