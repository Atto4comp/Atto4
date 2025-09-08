'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';

interface VideoPlayerProps {
  mediaId: number | string;
  mediaType: 'movie' | 'tv';
  title?: string;
  onClose?: () => void;
}

export default function VideoPlayer({
  mediaId,
  mediaType,
  title,
  onClose
}: VideoPlayerProps) {
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    // ✅ INSTANT: No async calls, no validation delays
    let result;
    if (mediaType === 'movie') {
      result = getMovieEmbed(mediaId);
    } else {
      result = getTVEmbed(mediaId);
    }
    
    setEmbedUrl(result.embedUrl);
    setLoading(false);
    
    console.log(`${mediaType} embed: ${result.embedUrl}`);
  }, [mediaId, mediaType]);

  const handleClose = () => onClose ? onClose() : router.back();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
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
          <h1 className="text-white font-bold text-lg">{title}</h1>
        )}
      </div>
    </div>
  );
}
