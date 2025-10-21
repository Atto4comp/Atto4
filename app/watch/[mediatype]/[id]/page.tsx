'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { tmdbApi } from '@/lib/api/tmdb';
import Atto4Player from '@/components/players/Atto4Player';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const mediaType = params?.mediatype as 'movie' | 'tv';
  const id = parseInt(params?.id as string, 10);
  const season = parseInt(searchParams.get('season') || '1', 10);
  const episode = parseInt(searchParams.get('episode') || '1', 10);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    async function loadMediaData() {
      setLoading(true);
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

    if (id) loadMediaData();
  }, [id, mediaType]);

  const handleClose = () => router.back();

  const handleTelemetry = async (event: any) => {
    try {
      await fetch('/api/telemetry/watch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'anonymous', // Replace with actual user ID
          titleId: id.toString(),
          mediaType,
          season: mediaType === 'tv' ? season : undefined,
          episode: mediaType === 'tv' ? episode : undefined,
          eventType: event.type,
          position: event.position,
          duration: event.duration,
        }),
      });
    } catch (error) {
      console.error('Telemetry error:', error);
    }
  };

  if (loading || !mediaData) {
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

  return (
    <Atto4Player
      titleId={id.toString()}
      mediaType={mediaType}
      season={season}
      episode={episode}
      title={title}
      poster={poster}
      onBack={handleClose}
      onTelemetry={handleTelemetry}
    />
  );
}
