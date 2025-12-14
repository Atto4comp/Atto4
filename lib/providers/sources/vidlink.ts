import { flags, targets, makeProviders } from '@p-stream/providers';
import { proxifyM3U8 } from '@/lib/proxy-utils';

export const vidlinkScraper = {
  id: 'vidlink',
  name: 'VidLink',
  rank: 100,
  flags: [flags.CORS_ALLOWED], // We handle CORS manually via proxy
  scrape: async ({ media, episode, season }) => {
    // 1. Construct the Direct ID
    // Movie: https://vidlink.pro/movie/{tmdb}
    // TV: https://vidlink.pro/tv/{tmdb}/{season}/{episode}
    const isMovie = !episode;
    const baseId = isMovie ? `movie/${media.tmdbId}` : `tv/${media.tmdbId}/${season}/${episode}`;
    
    // 2. The "secret" direct m3u8 link format for Vidlink
    // Note: This often redirects, so our Proxy must handle the 302s (standard fetch does this automatically)
    const playlistUrl = `https://vidlink.pro/api/${baseId}/playlist.m3u8`; 
    // ^ IF this fails, try the old format: `https://vidlink.pro/${baseId}.m3u8`

    const headers = {
      'Referer': 'https://vidlink.pro/',
      'Origin': 'https://vidlink.pro',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    try {
      // 3. Convert to a "Safe" Blob URL immediately
      // This pre-validates the stream exists AND fixes the CORS issues
      const safeStreamUrl = await proxifyM3U8(playlistUrl, headers);

      return {
        stream: [{
          id: 'primary',
          type: 'hls',
          playlist: safeStreamUrl, // Use the BLOB url
          flags: [flags.CORS_ALLOWED],
          captions: [],
          // We don't need headers here anymore because they are baked into the Blob!
        }]
      };
    } catch (e) {
      console.error("Vidlink failed", e);
      throw new Error("Stream not found");
    }
  }
};
