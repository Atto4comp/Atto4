'use client';

import { useEffect, useState } from 'react';
import { providers } from '@/lib/providers/base';
import HLSPlayer from '@/components/player/HLSPlayer';

export default function WatchPageClient({
  mediaType,
  mediaId,
  season = 1,
  episode = 1,
  title,
  mediaData,
}: any) {
  const [stream, setStream] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const result = await providers.runAll({
          media: {
            type: mediaType,
            title,
            tmdbId: String(mediaId),
            season: { number: season },
            episode: { number: episode },
          },
        });

        if (!result?.stream) {
          setError('No stream found');
          return;
        }

        setStream(result.stream);
      } catch (e: any) {
        setError(e.message);
      }
    }

    load();
  }, [mediaType, mediaId, season, episode, title]);

  if (error) return <div>{error}</div>;
  if (!stream) return <div>Loading stream...</div>;

  return (
    <HLSPlayer
      src={stream.playlist}
      headers={stream.headers}
      poster={
        mediaData?.backdrop_path
          ? `https://image.tmdb.org/t/p/original${mediaData.backdrop_path}`
          : undefined
      }
      title={title}
    />
  );
}
