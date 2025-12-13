import { flags, SourcererOutput, ShowScrapeContext, MovieScrapeContext } from '@p-stream/providers';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const isMovie = ctx.media.type === 'movie';
  
  // 1. Build the VidSrc Embed URL
  const embedUrl = isMovie
    ? `https://vidsrc-embed.ru/embed/movie/${ctx.media.tmdbId}`
    : `https://vidsrc-embed.ru/embed/tv/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;

  // 2. Fetch the page via Proxy
  const pageHtml = await ctx.proxiedFetcher<string>(embedUrl, {
    headers: {
      Referer: 'https://vidsrc-embed.ru/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  });

  // 3. Extract the stream
  // VidSrc usually embeds the HLS link in the HTML or a script. 
  // We try a generic m3u8 regex first.
  const match = pageHtml.match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/);
  
  if (!match) {
    // Fallback: Check if they use an iframe to another provider (common in VidSrc)
    // If so, we might need to extract that iframe URL.
    // For now, let's assume direct extraction or fail.
    console.log("VidSrc HTML Dump:", pageHtml.substring(0, 500)); // Debug log
    throw new Error('No stream found in VidSrc');
  }

  const playlistUrl = match[1];

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
          Referer: 'https://vidsrc-embed.ru/',
          Origin: 'https://vidsrc-embed.ru',
        }
      }
    ]
  };
}

export const vidsrcScraper = {
  id: 'vidsrc',
  name: 'VidSrc',
  rank: 190, // Slightly lower than Vidzee
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
  disabled: false,
};
