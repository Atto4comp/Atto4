// lib/api/video-tv.ts

import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
  allSources?: { url: string; label: string }[];
}

// 🔐 CORRECTED ENCRYPTED KEYS FOR TV
const SERVERS = [
  {
    id: 'vidme',
    label: 'Vidme',
    // https://www.vidking.net/embed/tv/
    key: "L3Z0L2RlYm1lL3Rlbi5nbmlrZGl2Lnd3dy8vc3B0dGg="
  },
  {
    id: 'fmovies4u',
    label: 'Fmovies',
    // https://fmovies4u.com/embed/tmdb-tv-
    key: "LXZ0LWJkbXQvZWJtZWQvbW9jLnU0c2Vpdm9tZi8vc3B0dGg="
  },
  {
    id: 'bidsrc',
    label: 'BidSrc',
    // https://bidsrc.pro/tv/
    key: "L3Z0L29ycC5jcnNkaWIvc3B0dGg="
  },
  {
    id: 'vidlink',
    label: 'VidLink',
    // https://vidlink.pro/tv/
    key: "L3Z0L29ycC5rbmlsdmlkL3NwdHRo"
  },
  {
    id: 'vidzy',
    label: 'Vidzy',
    // https://player.vidzee.wtf/embed/tv/
    key: "L3Z0L2RlYm1lL2Z0dy5lZXpkaXYucmV5YWxwL3NwdHRo"
  }
];


// ⚙️ Configs (Suffixes with placeholders for season/episode)
const CONFIGS: Record<string, string> = {
  vidfast: "/${season}/${episode}",
  bidsrc: "/${season}/${episode}",
  fmovies4u: "/${season}/${episode}?autoPlay=false", // Correct logic for TV
  vidlink: "/${season}/${episode}", // Standard S/E format
  vidly: "/${season}/${episode}?autoPlay=true&hideTitle=true",
  cinezo: "/${season}/${episode}",
  vidme: "/${season}/${episode}?color=5865f2&autoPlay=true&nextEpisode=true&episodeSelector=true",
  vidzy: "/${season}/${episode}?autoplay=true",
};

export function getTVEmbed(id: string | number, season: number = 1, episode: number = 1): TVEmbedResult {
  const sources = SERVERS.map(s => {
    // Fill in season/episode into the suffix string
    const config = CONFIGS[s.id] || "/${season}/${episode}"; // Default fallback
    const filledSuffix = config
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
