import { getServerLabel } from './video-common';

export interface TVEmbedResult {
  embedUrl: string;
  provider: string;
}

function getTVProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_TV_EMBED_1 || 'https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=${backlink}',
    process.env.NEXT_PUBLIC_TV_EMBED_2 || '',
    process.env.NEXT_PUBLIC_TV_EMBED_3 || '',
    process.env.NEXT_PUBLIC_TV_EMBED_4 || '',
    process.env.NEXT_PUBLIC_TV_API_BASE || '',
  ]
    .map(p => (p || '').trim())
    .filter(Boolean);

  // Default template with backlink placeholder
  return providers.length > 0
    ? providers
    : ['https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}?logo=false&tips=false&theme=default&allinone=true&backlink=${backlink}'];
}

function fillTvTemplate(
  tpl: string,
  id: string | number,
  season: string | number,
  episode: string | number,
  backlink: string
) {
  const safeId = String(id);
  const safeS = String(season);
  const safeE = String(episode);
  const safeBacklink = encodeURIComponent(backlink);
  return tpl
    .replace(/\$\{id\}/g, safeId)
    .replace(/\$\{season\}/g, safeS)
    .replace(/\$\{episode\}/g, safeE)
    .replace(/\$\{backlink\}/g, safeBacklink);
}

/**
 * Get TV embed URL (defaults to internal proxy, with optional direct fallback).
 */
export function getTVEmbed(
  id: string | number,
  season: string | number,
  episode: string | number
): TVEmbedResult {
  const providers = getTVProviders();
  const providerUrl = providers[0];
  const providerLabel = getServerLabel(providerUrl);

  // ENV toggle: set NEXT_PUBLIC_USE_INTERNAL_EMBED='0' to bypass proxy (for debugging)
  const useInternal =
    (process.env.NEXT_PUBLIC_USE_INTERNAL_EMBED ?? '1') !== '0';

  if (useInternal) {
    return {
      embedUrl: `/embed/tv/${id}/${season}/${episode}`,
      provider: `Browser Proxy (${providerLabel})`,
    };
  }

  // Direct provider fallback (kept for flexibility)
  const backlink = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro/';
  const embedUrl = fillTvTemplate(providerUrl, id, season, episode, backlink);

  return {
    embedUrl,
    provider: providerLabel,
  };
}

export default { getTVEmbed };

