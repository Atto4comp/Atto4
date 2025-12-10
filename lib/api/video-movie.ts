// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔐 ENCRYPTED KEYS (Obfuscated)
const SERVERS = [
  { 
    id: 'vidly', 
    label: 'Vidly', 
    // "https://fmovies4u.com/embed/tmdb-movie-"
    key: "LWVpdm9tLWJkbXQvZGViZW0vbW9jLnU0c2Vpdm9tZi8vOnNwdHRo" 
  },
  { 
    id: 'cinezo', 
    label: 'Cinezo', 
    // "https://api.cinezo.net/media/tmdb-movie-"
    key: "LWVpdm9tLWJkbXQvaWRlbS90ZW4uLXplemluLmMuaXBhLy86c3B0dGg=" 
  },
  { 
    id: 'vidme', 
    label: 'Vidme', 
    // "https://www.vidking.net/embed/movie/"
    key: "L2Vpdm9tL2RlYm1lL3Rlbi5Zbmlra2Rpdi53d3cvLzpzcHR0aA==" 
  },
  { 
    id: 'vidzy', 
    label: 'Vidzy', 
    // "https://bidsrc.pro/movie/"
    key: "L2Vpdm9tL29ycC5jcnNkaWIvLzpzcHR0aA==" 
  },
  { 
    id: 'vidon', 
    label: 'Vidon', 
    // "https://player.vidplus.to/embed/movie/"
    key: "L2Vpdm9tL2RlYm1lL290LnN1bHBkaXYucmV5YWxwLy86c3B0dGg=" 
  }
];

// ⚙️ Configs (Suffixes) for each provider
const CONFIGS: Record<string, string> = {
  vidly: "?autoPlay=true&hideTitle=true",
  cinezo: "",
  vidme: "?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "?autoplay=true",
  vidon: "?autoplay=true&poster=true&title=true&watchparty=false&chromecast=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5"
};

export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const sources = SERVERS.map(s => ({
    encryptedKey: s.key,     // The base URL (encrypted)
    suffix: CONFIGS[s.id],   // The query params (plain text is fine)
    mediaId: id,
    label: s.label,
    isEncrypted: true
  }));

  return {
    embedUrl: "", // Unused
    provider: "Obfuscated",
    allSources: sources as any
  };
}

export default { getMovieEmbed };
