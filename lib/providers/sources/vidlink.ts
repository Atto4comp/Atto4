// lib/providers/sources/vidlink.ts
import { makeSourcerer, SourcererOutput } from '@p-stream/providers';
import { MovieScrapeContext, ShowScrapeContext } from '@p-stream/providers';

async function comboScraper(
  ctx: MovieScrapeContext | ShowScrapeContext
): Promise<SourcererOutput> {
  const isMovie = ctx.media.type === 'movie';

  const url = isMovie
    ? `https://vidlink.pro/movie/${ctx.media.tmdbId}.m3u8`
    : `https://vidlink.pro/tv/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}.m3u8`;

  return {
    embeds: [
      {
        embedId: 'vidlink',
        url,
      },
    ],
  };
}

export const vidlinkSource = makeSourcerer({
  id: 'vidlink-source',
  name: 'VidLink',
  rank: 200,
  disabled: false,
  flags: [],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
});
