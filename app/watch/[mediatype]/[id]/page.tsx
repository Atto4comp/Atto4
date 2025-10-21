// app/watch/[mediatype]/[id]/page.tsx
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import Atto4Player from '@/components/players/Atto4Player';
import MoviePlayer from '@/components/players/MoviePlayer';
import TvPlayer from '@/components/players/TvPlayer';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [useCustomPlayer, setUseCustomPlayer] = useState(
    process.env.NEXT_PUBLIC_USE_CUSTOM_PLAYER === 'true'
  );

  const mediaType = params?.mediatype as 'movie' | 'tv';
  const id = parseInt(params?.id as string, 10);
  const season = parseInt(searchParams.get('season') || '1', 10);
  const episode = parseInt(searchParams.get('episode') || '1', 10);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    async function loadMedia() {
      try {
        const data = mediaType === 'movie' 
          ? await tmdbApi.getMovieDetails(id)
          : await tmdbApi.getTVShowDetails(id);
        setMediaData(data);
      } catch (error) {
        console.error('Failed to load media:', error);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadMedia();
  }, [id, mediaType]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const title = mediaData?.title ?? mediaData?.name ?? '';
  const poster = mediaData?.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${mediaData.backdrop_path}`
    : undefined;

  // Custom Atto4 Player (with Streamlink)
  if (useCustomPlayer) {
    return (
      <Atto4Player
        titleId={id.toString()}
        mediaType={mediaType}
        season={season}
        episode={episode}
        title={title}
        poster={poster}
        onBack={() => router.back()}
        onTelemetry={(event) => {
          fetch('/api/telemetry/watch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: 'anonymous',
              titleId: id.toString(),
              mediaType,
              season: mediaType === 'tv' ? season : undefined,
              episode: mediaType === 'tv' ? episode : undefined,
              eventType: event.type,
              position: event.position,
              duration: event.duration,
            }),
          }).catch(console.error);
        }}
      />
    );
  }

  // Fallback to iframe players
  if (mediaType === 'movie') {
    return (
      <MoviePlayer
        mediaId={id}
        title={title}
        onClose={() => router.back()}
      />
    );
  }

  if (mediaType === 'tv') {
    return (
      <TvPlayer
        mediaId={id}
        season={season}
        episode={episode}
        title={title}
        onClose={() => router.back()}
      />
    );
  }

  return null;
}
