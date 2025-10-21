export const playerConfig = {
  useCustomPlayer: process.env.NEXT_PUBLIC_USE_CUSTOM_PLAYER === 'true',
  fallbackMode: (process.env.NEXT_PUBLIC_PLAYER_FALLBACK as 'iframe' | 'custom') || 'custom',
  streamlinkEnabled: process.env.STREAMLINK_ENABLED === 'true',
  
  // Feature flags
  features: {
    catalog: true,
    telemetry: true,
    continueWatching: true,
    qualitySelector: true,
    pip: true,
  },
};

export function shouldUseCustomPlayer(): boolean {
  return playerConfig.useCustomPlayer;
}
