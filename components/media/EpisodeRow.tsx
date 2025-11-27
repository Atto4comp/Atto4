'use client';

import { useState } from 'react';
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
}

// Placeholder logic for "Check File"
const checkFileAvailability = (episodeId: number) => {
  // This would be your real API call
  return Math.random() > 0.5; // 50% chance it exists
};

export default function EpisodeRow({ episodes, onPlay }: EpisodeRowProps) {
  const [downloadStatus, setDownloadStatus] = useState<Record<number, 'idle' | 'checking' | 'available' | 'unavailable'>>({});

  const handleDownloadClick = (e: React.MouseEvent, episodeId: number) => {
    e.stopPropagation();
    
    if (downloadStatus[episodeId] === 'available') {
      alert('Starting download...');
      return;
    }

    setDownloadStatus(prev => ({ ...prev, [episodeId]: 'checking' }));

    // Simulate check delay
    setTimeout(() => {
      const exists = checkFileAvailability(episodeId);
      setDownloadStatus(prev => ({ 
        ...prev, 
        [episodeId]: exists ? 'available' : 'unavailable' 
      }));
      
      if (!exists) {
        setTimeout(() => {
          setDownloadStatus(prev => ({ ...prev, [episodeId]: 'idle' }));
        }, 2000);
      }
    }, 1000);
  };

  if (!episodes?.length) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide pb-8 pt-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-4 w-max">
        {episodes.map((episode) => (
          <div 
            key={episode.id} 
            className="group relative w-[280px] sm:w-[320px] flex-shrink-0 cursor-pointer"
            onClick={() => onPlay(episode)}
          >
            {/* Episode Thumbnail Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/10 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-lg">
              
              {/* Image */}
              <Image
                src={episode.still_path 
                  ? `https://image.tmdb.org/t/p/w500${episode.still_path}`
                  : '/placeholder-backdrop.jpg'
                }
                alt={episode.name}
                fill
                className={`object-cover transition-all duration-500 ${
                  downloadStatus[episode.id] && downloadStatus[episode.id] !== 'idle' 
                    ? 'blur-sm scale-105 opacity-50' 
                    : 'group-hover:scale-105'
                }`}
              />

              {/* Play Overlay (Default Hover) */}
              <div className={`absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                downloadStatus[episode.id] && downloadStatus[episode.id] !== 'idle' ? 'hidden' : ''
              }`}>
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="w-5 h-5 fill-black ml-1" />
                </div>
              </div>

              {/* Download Overlay Logic */}
              <button
                onClick={(e) => handleDownloadClick(e, episode.id)}
                className={`absolute top-2 right-2 z-20 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
                  downloadStatus[episode.id] === 'available'
                    ? 'bg-green-500 text-white'
                    : downloadStatus[episode.id] === 'unavailable'
                    ? 'bg-red-500 text-white'
                    : 'bg-black/50 text-white hover:bg-white hover:text-black'
                }`}
              >
                {downloadStatus[episode.id] === 'checking' ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : downloadStatus[episode.id] === 'available' ? (
                  <Check className="w-4 h-4" />
                ) : downloadStatus[episode.id] === 'unavailable' ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>

              {/* Status Message Overlay */}
              {(downloadStatus[episode.id] === 'available' || downloadStatus[episode.id] === 'unavailable') && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <span className="font-bold font-chillax text-white text-lg drop-shadow-lg">
                    {downloadStatus[episode.id] === 'available' ? 'Download Ready' : 'Not Available'}
                  </span>
                </div>
              )}

              {/* Episode Number Badge */}
              <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white border border-white/10">
                EP {episode.episode_number}
              </div>
            </div>

            {/* Meta Info */}
            <div className="mt-3 px-1">
              <h4 className="text-white font-medium leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                {episode.name}
              </h4>
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                {episode.overview || 'No description available.'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
