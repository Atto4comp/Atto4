import {
  flags,
  SourcererOutput,
  MovieScrapeContext,
  ShowScrapeContext,
} from '@p-stream/providers';
import { createM3U8ProxyUrl } from '@p-stream/providers/utils/proxy';

async function comboScraper(
  ctx: MovieScrapeContext | ShowScrapeContext
): Promise<SourcererOutput> {
  const isMovie = ctx.media.type === 'movie';

  const playlist = isMovie
    ? `https://vidlink.pro/movie/${ctx.media.tmdbId}.m3u8`
    : `https://vidlink.pro/tv/${ctx.media.tmdbId}/${ctx.media.season.number}/${ctx.media.episode.number}.m3u8`;

  const headers = {
    Referer: 'https://vidlink.pro/',
    Origin: 'https://vidlink.pro',
  };

  return {
    embeds: [],
    stream: [
      {
        id: 'primary',
        type: 'hls',
        playlist: createM3U8ProxyUrl(
          playlist,
          ctx.features,
          headers
        ),
        headers,
        flags: [flags.CORS_ALLOWED],
        captions: [],
      },
    ],
  };
}

export const vidlinkScraper = {
  id: 'vidlink',
  name: 'VidLink',
  rank: 250,
  flags: [flags.CORS_ALLOWED],
  scrapeMovie: comboScraper,
  scrapeShow: comboScraper,
  disabled: false,
};
