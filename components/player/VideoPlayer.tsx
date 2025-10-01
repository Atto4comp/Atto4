'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  onClose?: () => void;
}

export default function VideoPlayer({
  mediaId,
  mediaType,
  season = 1,
  episode = 1,
  title,
  onClose
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  // DevTools protection (same as before)
  useEffect(() => {
    // ... DevTools protection code (same as in TvPlayer)
  }, [router]);

  useEffect(() => {
    // ✅ FIXED: Use correct parameters for TV shows
    let result;
    if (mediaType === 'movie') {
      result = getMovieEmbed(mediaId);
    } else {
      // Pass actual season and episode for TV shows
      result = getTVEmbed(mediaId, season, episode);
    }
    
    setEmbedUrl(result.embedUrl);
    setLoading(false);
    
    const displayInfo = mediaType === 'tv' ? `S${season}E${episode}` : 'Movie';
    console.log(`${mediaType} embed: ${displayInfo} - ${result.embedUrl}`);
  }, [mediaId, mediaType, season, episode]);

  const handleClose = () => onClose ? onClose() : router.back();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">
          Loading {mediaType === 'tv' ? `Season ${season}, Episode ${episode}` : 'Movie'}...
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        style={{ border: 'none' }}
      />
      
      <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
        <button
          onClick={handleClose}
          className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        {title && (
          <h1 className="text-white font-bold text-lg">
            {title} {mediaType === 'tv' ? `- S${season}E${episode}` : ''}
          </h1>
        )}
      </div>
    </div>
  );
}


