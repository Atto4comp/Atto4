// lib/providers/embeds/vidlink.ts
import { makeEmbed, flags } from '@p-stream/providers';
import { createM3U8ProxyUrl } from '@p-stream/providers/utils/proxy';

export const vidlinkEmbed = makeEmbed({
  id: 'vidlink',
  name: 'VidLink',
  rank: 250, // High priority
  disabled: false,

  async scrape(ctx) {
    // ctx.url IS the .m3u8 URL
    const playlist = ctx.url;

    const headers = {
      Referer: 'https://vidlink.pro/',
      Origin: 'https://vidlink.pro',
    };

    return {
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
  },
});
