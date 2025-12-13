import { flags, SourcererOutput, ShowScrapeContext, MovieScrapeContext } from '@p-stream/providers';

async function comboScraper(ctx: ShowScrapeContext | MovieScrapeContext): Promise<SourcererOutput> {
  const isMovie = ctx.media.type === 'movie';
  const embedUrl = isMovie
    ? `https://player.vidzee.wtf/embed/movie/${ctx.media.tmdbId}`
    : `https://player.vidzee.wtf/embed/tv/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}`;

  const pageHtml = await ctx.proxiedFetcher<string>(embedUrl, {
    headers: { Referer: 'https://vidzee.wtf/' }
  });

  const match = pageHtml.match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/);
  if (!match) throw new Error('No stream found');

  return {
    embeds: [],
    stream: [
      {
        id: 'primary',
        type: 'hls',
        playlist: match[1],
        flags: [flags.CORS_ALLOWED],
        captions: [],
        headers: { Referer: 'https://player.vidzee.wtf/' }
      }
    ]
  };
}

// Just export the object. TS will check compatibility when you pass it to .addSource()
export const vidzeeScraper = {
  id: 'vidzee',
  name: 'Vidzee',
  rank: 200,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
  disabled: false,
};
