'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

import HLSPlayer from '@/components/player/HLSPlayer';
import { providers } from '@/lib/providers/base';
import { Stream } from '@p-stream/providers';

interface WatchPageClientProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  season?: number;
  episode?: number;
  title: string;
  mediaData: any;
}

export default function WatchPageClient({
  mediaType,
  mediaId,
  season = 1,
  episode = 1,
  title,
  mediaData,
}: WatchPageClientProps) {
  const router = useRouter();

  const [stream, setStream] = useState<Stream | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStream() {
      try {
        setLoading(true);
        setError(null);

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
          throw new Error('No stream available');
        }

        if (active) setStream(result.stream);
      } catch (e: any) {
        if (active) setError(e.message || 'Failed to load stream');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStream();
    return () => {
      active = false;
    };
  }, [mediaType, mediaId, season, episode, title]);

  const poster =
    mediaData?.backdrop_path
      ? `https://image.tmdb.org/t/p/original${mediaData.backdrop_path}`
      : undefined;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-white/70">Finding best stream…</p>
      </div>
    );
  }

  if (error || !stream) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h2 className="text-white text-xl font-bold mb-2">
          Stream unavailable
        </h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-white text-black rounded-full font-bold"
        >
          Go back
        </button>
      </div>
    );
  }

  // Extract HLS URL
  let src = '';
  if (stream.type === 'hls') {
    src = stream.playlist;
  } else {
    const q = stream.qualities;
    src =
      q['1080']?.url ||
      q['720']?.url ||
      q['unknown']?.url ||
      '';
  }

  return (
    <HLSPlayer
      src={src}
      poster={poster}
      title={
        mediaType === 'tv'
          ? `${title} · S${season}E${episode}`
          : title
      }
      onClose={() => router.back()}
    />
  );
}
