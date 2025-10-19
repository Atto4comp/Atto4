import { getServerLabel } from './video-common';

export interface MovieEmbedResult {
  embedUrl: string;
  provider: string;
}

function getMovieProviders() {
  const providers = [
    process.env.NEXT_PUBLIC_MOVIE_EMBED_1 || 'https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&backlink=${backlink}',
    process.env.NEXT_PUBLIC_MOVIE_EMBED_2 || '',
    process.env.NEXT_PUBLIC_MOVIE_EMBED_3 || '',
    process.env.NEXT_PUBLIC_MOVIE_EMBED_4 || '',
    process.env.NEXT_PUBLIC_MOVIE_API_BASE || '',
  ]
    .map(p => (p || '').trim())
    .filter(Boolean);

  // Default template with backlink placeholder
  return providers.length > 0
    ? providers
    : ['https://iframe.pstream.mov/embed/tmdb-movie-${id}?logo=false&tips=false&theme=default&allinone=true&backlink=${backlink}'];
}

function fillMovieTemplate(tpl: string, id: string | number, backlink: string) {
  const safeId = String(id);
  const safeBacklink = encodeURIComponent(backlink);
  return tpl
    .replace(/\$\{id\}/g, safeId)
    .replace(/\$\{backlink\}/g, safeBacklink);
}

/**
 * Get movie embed URL (defaults to internal proxy, with optional direct fallback).
 */
export function getMovieEmbed(id: string | number): MovieEmbedResult {
  const providers = getMovieProviders();
  const providerUrl = providers[0];
  const providerLabel = getServerLabel(providerUrl);

  // ENV toggle: set NEXT_PUBLIC_USE_INTERNAL_EMBED='0' to bypass proxy (for debugging)
  const useInternal =
    (process.env.NEXT_PUBLIC_USE_INTERNAL_EMBED ?? '1') !== '0';

  if (useInternal) {
    return {
      embedUrl: `/embed/movie/${id}`,
      provider: `Browser Proxy (${providerLabel})`,
    };
  }

  // Direct provider fallback (kept for flexibility)
  const backlink = process.env.NEXT_PUBLIC_BACKLINK ?? 'https://atto4.pro/';
  const embedUrl = fillMovieTemplate(providerUrl, id, backlink);

  return {
    embedUrl,
    provider: providerLabel,
  };
}

export default { getMovieEmbed };

