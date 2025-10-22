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
    movieTemplate: '',
    tvTemplate: '',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'vidsrc_pro',
    name: 'VidSrc Pro',
    priority: 2,
    movieTemplate: '',
    tvTemplate: '',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'vidstream',
    name: 'VidStream',
    priority: 3,
    movieTemplate: '',
    tvTemplate: '',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'embedsu',
    name: 'Embedsu',
    priority: 4,
    movieTemplate: '',
    tvTemplate: '',
    enabled: true,
    requiresStreamlink: true,
  },
  {
    id: 'pstream',
    name: 'P-Stream',
    priority: 5,
    movieTemplate: '',
    tvTemplate: '',
    enabled: false, // Fallback iframe (not streamlink)
    requiresStreamlink: false,
  },
];

export function getEnabledProviders(): ProviderConfig[] {
  return providers.filter(p => p.enabled).sort((a, b) => a.priority - b.priority);
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
    .replace('${season}', String(season || 1))
    .replace('${episode}', String(episode || 1));
}
