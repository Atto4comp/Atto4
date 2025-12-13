import { flags, SourcererOutput, ShowScrapeContext, MovieScrapeContext } from '@p-stream/providers';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const isMovie = ctx.media.type === 'movie';
  
  // 1. Construct the target HLS URL directly
  // Base: https://vidlink.pro
  // Movie: /movie/{id}.m3u8
  // TV: /tv/{id}/{season}/{episode}.m3u8 
  const playlistUrl = isMovie
    ? `https://vidlink.pro/movie/${ctx.media.tmdbId}.m3u8`
    : `https://vidlink.pro/tv/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}.m3u8`;

  console.log("Testing VidLink URL:", playlistUrl);

  // 2. Validate it exists (Head Request via Proxy)
  // We do this because if we just return it and it's 404, the player will error out ugly.
  try {
    const res = await ctx.proxiedFetcher(playlistUrl, {
      method: 'HEAD'
    });
    // @p-stream fetcher throws on 404 usually, or we check status if it returns object
  } catch (e) {
    throw new Error('VidLink stream not found (404)');
  }

  // 3. Return the Stream
  return {
    embeds: [],
    stream: [
      {
        id: 'primary',
        type: 'hls',
        playlist: playlistUrl,
        flags: [flags.CORS_ALLOWED],
        captions: [],
        headers: {
          Referer: 'https://vidlink.pro/',
          Origin: 'https://vidlink.pro',
        }
      }
    ]
  };
}

export const vidlinkScraper = {
  id: 'vidlink',
  name: 'VidLink',
  rank: 250, // Highest priority since we verified it works
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
  disabled: false,
};
