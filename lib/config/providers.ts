export interface ProviderConfig {
  id: string;
  name: string;
  priority: number;
  movieTemplate: string;
  tvTemplate: string;
  enabled: boolean;
  requiresStreamlink: boolean;
}

export const providers: ProviderConfig[] = [
  {
    id: 'vidsrc',
    name: 'VidSrc',
    priority: 1,
    movieTemplate: 'https://vidsrc.to/embed/movie/${id}',
    tvTemplate: 'https://vidsrc.to/embed/tv/${id}/${season}/${episode}',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'vidsrc_pro',
    name: 'VidSrc Pro',
    priority: 2,
    movieTemplate: 'https://vidsrc.pro/embed/movie/${id}',
    tvTemplate: 'https://vidsrc.pro/embed/tv/${id}/${season}/${episode}',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'vidstream',
    name: 'VidStream',
    priority: 3,
    movieTemplate: 'https://vidstream.pro/e/tmdb-${id}',
    tvTemplate: 'https://vidstream.pro/e/tmdb-${id}/${season}/${episode}',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'embedsu',
    name: 'Embedsu',
    priority: 4,
    movieTemplate: 'https://embed.su/embed/movie/${id}',
    tvTemplate: 'https://embed.su/embed/tv/${id}/${season}/${episode}',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'pstream',
    name: 'P-Stream',
    priority: 5,
    movieTemplate: 'https://iframe.pstream.mov/embed/tmdb-movie-${id}',
    tvTemplate: 'https://iframe.pstream.mov/embed/tmdb-tv-${id}/${season}/${episode}',
    enabled: false, // Fallback iframe (not streamlink)
    requiresStreamlink: false,
  },
];

export function getEnabledProviders(): ProviderConfig[] {
  return providers
    .filter((p) => p.enabled)
    .sort((a, b) => a.priority - b.priority);
}

export function buildProviderUrl(
  provider: ProviderConfig,
  mediaType: 'movie' | 'tv',
  id: string | number,
  season?: number,
  episode?: number
): string {
  const template = mediaType === 'movie' ? provider.movieTemplate : provider.tvTemplate;
  return template
    .replace('${id}', String(id))
    .replace('${season}', String(season ?? 1))
    .replace('${episode}', String(episode ?? 1));
}
