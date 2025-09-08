'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';

interface MoviePlayerProps {
  mediaId: number | string;
  title?: string;
  onClose?: () => void;
}

export default function MoviePlayer({ mediaId, title, onClose }: MoviePlayerProps) {
  // ✅ URL STORAGE: Store movie embed URL
  const [embedUrl, setEmbedUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    const loadMovieEmbed = async () => {
      setLoading(true);
      try {
        // ✅ FAST MOVIE FETCH
        const result = await getMovieEmbed(mediaId);
        
        // ✅ STORE MOVIE URL
        setEmbedUrl(result.embedUrl);
        
        console.log(`🎬 Movie URL stored: ${result.embedUrl}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    loadMovieEmbed();
  }, [mediaId]);

  const handleClose = () => onClose?.() || router.back();

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white">Loading movie player...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-xl mb-4">Error Loading Movie</h2>
          <p className="mb-4">{error}</p>
          <button onClick={handleClose} className="px-4 py-2 bg-gray-600 rounded">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* ✅ MOVIE IFRAME: Uses stored embedUrl */}
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
