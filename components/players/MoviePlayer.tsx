'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';

export default function MoviePlayer({
  mediaId,
  onClose,
  backButton = 'hide',
}: {
  mediaId: number | string;
  onClose?: () => void;
  backButton?: 'auto' | 'show' | 'hide';
}) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBackBtn, setShowBackBtn] = useState(true);
  const router = useRouter();

  const handleClose = useCallback(() => onClose?.() || router.back(), [onClose, router]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    try {
      const result = getMovieEmbed(mediaId);
      const url = result?.embedUrl ?? '';
      if (mounted) setEmbedUrl(url);
      // Heuristic: back button logic
      if (backButton === 'show') setShowBackBtn(true);
      else if (backButton === 'hide') setShowBackBtn(false);
      else setShowBackBtn(!url.match(/back|close/i));
    } catch (err) {
      setError('Failed to load movie');
    } finally {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [mediaId, backButton, onClose, router]);

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
      {embedUrl ? (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          style={{ border: 'none' }}
        />
      ) : (
        <div className="text-white text-center py-8">No stream available.</div>
      )}
      {showBackBtn && (
        <div className="absolute top-4 left-4 z-30">
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="Close video and go back"
            title="Close"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
