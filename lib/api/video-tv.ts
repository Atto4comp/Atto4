// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔐 ENCRYPTED KEYS (Obfuscated)
const SERVERS = [
  { 
    id: 'vidly', 
    label: 'Vidly', 
    // "https://fmovies4u.com/embed/tmdb-tv-"
    key: "LXZ0LWJkbXQvZGViZW0vbW9jLnU0c2Vpdm9tZi8vOnNwdHRo" 
  },
  { 
    id: 'cinezo', 
    label: 'Cinezo', 
    // "https://api.cinezo.net/media/tmdb-tv-"
    key: "LXZ0LWJkbXQvaWRlbS90ZW4uLXplemluLmMuaXBhLy86c3B0dGg=" 
  },
  { 
    id: 'vidme', 
    label: 'Vidme', 
    // "https://www.vidking.net/embed/tv/"
    key: "L3Z0L2RlYm1lL3Rlbi5Zbmlra2Rpdi53d3cvLzpzcHR0aA==" 
  },
  { 
    id: 'vidzy', 
    label: 'Vidzy', 
    // "https://bidsrc.pro/tv/"
    key: "L3Z0L29ycC5jcnNkaWIvLzpzcHR0aA==" 
  },
  { 
    id: 'vidon', 
    label: 'Vidon', 
    // "https://player.vidplus.to/embed/tv/"
    key: "L3Z0L2RlYm1lL290LnN1bHBkaXYucmV5YWxwLy86c3B0dGg=" 
  }
];

// ⚙️ Configs
const CONFIGS: Record<string, string> = {
  vidly: "/${season}/${episode}?autoPlay=true&hideTitle=true",
  cinezo: "/${season}/${episode}",
  vidme: "/${season}/${episode}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "/${season}/${episode}?autoplay=true",
  vidon: "/${season}/${episode}?autoplay=true&autonext=true&nextbutton=true&poster=true&title=true&watchparty=false&chromecast=true&episodelist=true&servericon=true&setting=true&pip=true&hideprimarycolor=true&hidesecondarycolor=true&hideiconcolor=true&hideprogresscontrol=true&hideiconset=true&hideautonext=true&hideautoplay=true&hidenextbutton=true&hideposter=true&hidetitle=true&hidechromecast=true&hideepisodelist=true&hideservericon=true&hidepip=true&icons=netflix&primarycolor=6C63FF&secondarycolor=9F9BFF&iconcolor=FFFFFF&font=Roboto&fontcolor=FFFFFF&fontsize=20&opacity=0.5"
};

export function getTVEmbed(id: string | number, season: number = 1, episode: number = 1): TVEmbedResult {
  const sources = SERVERS.map(s => {
    // Fill in season/episode into the suffix string
    const filledSuffix = CONFIGS[s.id]
      .replace(/\$\{season\}/g, String(season))
      .replace(/\$\{episode\}/g, String(episode));

    return {
      encryptedKey: s.key,
      suffix: filledSuffix,
      mediaId: id,
      label: s.label,
      isEncrypted: true
    };
  });

  return {
    embedUrl: "",
    provider: "Obfuscated",
    allSources: sources as any
  };
}

export default { getTVEmbed };
