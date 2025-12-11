// lib/api/video-movie.ts

import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔐 CORRECTED ENCRYPTED KEYS
const SERVERS = [
  { 
    id: 'vidme', 
    label: 'Vidme', 
    // "https://www.vidking.net/embed/movie/"
    key: "L2Vpdm9tL2RlYm1lL3Rlbi5nbmlrZGl2Lnd3dy8vOnNwdHRo" 
  },
  {
    id: 'vidzy',
    label: 'Vidzy',
    // "https://player.vidzee.wtf/embed/movie/"
    key: "L2Vpdm9tL2RlYm1lL2Z0dy5lZXpkaXYucmV5YWxwLy86c3B0dGg="
  },
  { 
    id: 'vidzy', 
    label: 'Vidzy', 
    // "https://bidsrc.pro/movie/"
    key: "L2Vpdm9tL29ycC5jcnNkaWIvLzpzcHR0aA==" 
  }
];

// ⚙️ Configs (Suffixes)
const CONFIGS: Record<string, string> = {
  vidly: "?autoPlay=true&hideTitle=true",
  cinezo: "",
  vidme: "?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "?autoplay=true",
  vidzee: "", // No specific params provided
  vidrock: "", // No specific params provided
  vidon: "?autoplay=true&poster=true&title=true&watchparty=false&chromecast=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5"
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
