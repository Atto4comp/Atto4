'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Download, Check, Lock } from 'lucide-react';

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  still_path: string | null;
  runtime?: number;
  overview?: string;
}

interface EpisodeRowProps {
  episodes: Episode[];
  onPlay: (episode: Episode) => void;
  mediaId: number | string; // TMDB ID of the TV show
  season: number; // Current season number
  mediaType: 'tv' | 'movie'; // 'tv' for TV shows, 'movie' for movies
}

export default function EpisodeRow({ episodes, onPlay, mediaId, season, mediaType }: EpisodeRowProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<Record<number, 'idle' | 'checking' | 'available' | 'unavailable'>>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate download URL based on media type
  const getDownloadUrl = (episodeNumber: number) => {
    if (mediaType === 'tv') {
      return `https://dl.vidsrc.vip/tv/${mediaId}/${season}/${episodeNumber}`;
    } else {
      // For movies, typically no season/episode needed, just the ID
      return `https://dl.vidsrc.vip/movie/${mediaId}`;
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent, episode: Episode) => {
    e.stopPropagation();
    
    const episodeId = episode.id;
    const downloadUrl = getDownloadUrl(episode.episode_number);

    // If already marked available, trigger download immediately
    if (downloadStatus[episodeId] === 'available') {
      triggerHiddenDownload(downloadUrl);
      return;
    }

    // Check availability
    setDownloadStatus(prev => ({ ...prev, [episodeId]: 'checking' }));
    
    try {
      // Simple HEAD request to check if the download endpoint exists
      const response = await fetch(downloadUrl, { method: 'HEAD' });
      
      if (response.ok) {
        setDownloadStatus(prev => ({ ...prev, [episodeId]: 'available' }));
        triggerHiddenDownload(downloadUrl);
      } else {
        setDownloadStatus(prev => ({ ...prev, [episodeId]: 'unavailable' }));
        setTimeout(() => setDownloadStatus(prev => ({ ...prev, [episodeId]: 'idle' })), 2000);
      }
    } catch (error) {
      // On error (likely CORS), assume available and try downloading anyway
      setDownloadStatus(prev => ({ ...prev, [episodeId]: 'available' }));
      triggerHiddenDownload(downloadUrl);
    }
  };

  // ✅ New Helper: Trigger download via hidden iframe
  const triggerHiddenDownload = (url: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    
    // Clean up iframe after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 60000); // Remove after 1 minute
  };

  if (!episodes?.length) return null;

  const EpisodeCard = ({ episode }: { episode: Episode }) => {
    const status = downloadStatus[episode.id] || 'idle';
    
    return (
      <div 
        className="group relative flex-shrink-0 cursor-pointer w-full"
        onClick={() => onPlay(episode)}
      >
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/10 transition-all duration-300 group-hover:border-white/30 group-hover:shadow-lg">
          <Image
            src={episode.still_path 
              ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
              : '/placeholder-backdrop.jpg'
            }
            alt={episode.name}
            fill
            className={`object-cover transition-all duration-500 ${
              status !== 'idle' 
                ? 'blur-sm scale-105 opacity-50' 
                : 'group-hover:scale-105'
            }`}
            unoptimized
          />

          {/* Play Button Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            status !== 'idle' ? 'hidden' : ''
          }`}>
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-black ml-1" />
            </div>
          </div>

          {/* Download Button */}
          <button
            onClick={(e) => handleDownloadClick(e, episode)}
            className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
              status === 'available'
                ? 'bg-green-500 text-white hover:bg-green-600'
                : status === 'unavailable'
                ? 'bg-red-500 text-white'
                : status === 'checking'
                ? 'bg-blue-500 text-white'
                : 'bg-black/50 text-white hover:bg-white hover:text-black'
            }`}
            title={status === 'available' ? 'Download' : status === 'checking' ? 'Checking...' : 'Check availability'}
          >
            {status === 'checking' ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : status === 'available' ? (
              <Check className="w-4 h-4" />
            ) : status === 'unavailable' ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>

          {/* Status Overlay Messages */}
          {status === 'available' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="font-bold font-chillax text-white text-lg drop-shadow-lg">
                Downloading...
              </span>
            </div>
          )}
          
          {status === 'unavailable' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <span className="font-bold font-chillax text-white text-lg drop-shadow-lg">
                Not Available
              </span>
            </div>
          )}

          {/* Episode Number Badge */}
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white border border-white/10">
            EP {episode.episode_number}
          </div>
        </div>

        {/* Episode Info */}
        <div className="mt-3 px-1">
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-white font-bold leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors text-sm md:text-base">
              {episode.episode_number}. {episode.name}
            </h4>
            {episode.runtime && (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{episode.runtime}m</span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {episode.overview || 'No description available.'}
          </p>
        </div>
      </div>
    );
  };

  // Mobile: Horizontal Scroll
  if (isMobile) {
    return (
      <div className="w-full overflow-x-auto scrollbar-hide pb-8 pt-2 -mx-4 px-4">
        <div className="flex gap-4 w-max">
          {episodes.map(ep => (
            <div key={ep.id} className="w-[280px]">
              <EpisodeCard episode={ep} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Responsive Grid
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
      {episodes.map(ep => (
        <EpisodeCard key={ep.id} episode={ep} />
      ))}
    </div>
  );
}
