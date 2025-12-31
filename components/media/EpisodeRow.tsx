'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Download, X, Loader2 } from 'lucide-react';

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
  mediaId: number | string; 
  season: number; 
  mediaType: 'tv' | 'movie'; 
}

export default function EpisodeRow({ episodes, onPlay, mediaId, season, mediaType }: EpisodeRowProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  // 🔽 NEW: State for Download Modal
  const [showDownload, setShowDownload] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Open Modal with specific episode URL
  const handleDownloadOpen = (e: React.MouseEvent, episodeNumber: number) => {
    e.stopPropagation(); // Prevent card click (play)
    setDownloadUrl(`https://dl.vidsrc.vip/tv/${mediaId}/${season}/${episodeNumber}`);
    setShowDownload(true);
  };

  // ========================
  // SHARED: DOWNLOAD MODAL
  // ========================
  const DownloadModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
      <div className="relative w-full max-w-4xl h-[80vh] bg-[#1a1a1a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-white text-lg">Download Episode</h3>
          </div>
          <button 
            onClick={() => setShowDownload(false)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 relative bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
             <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
          <iframe 
            src={downloadUrl}
            className="relative z-10 w-full h-full border-0"
            allow="autoplay; encrypted-media"
            title="Download Frame"
          />
        </div>

         {/* Modal Footer */}
         <div className="px-6 py-3 bg-[#0f0f0f] border-t border-white/5 text-center">
           <p className="text-xs text-gray-500">
             If the download doesn't start automatically, please interact with the window above.
           </p>
         </div>
      </div>
    </div>
  );

  if (!episodes?.length) return null;

  const EpisodeCard = ({ episode }: { episode: Episode }) => (
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
          className="object-cover transition-all duration-500 group-hover:scale-105"
          unoptimized
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-black ml-1" />
          </div>
        </div>

        {/* ✅ Updated Download Button (Triggers Modal) */}
        <button
          onClick={(e) => handleDownloadOpen(e, episode.episode_number)}
          className="absolute top-2 right-2 z-20 p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all duration-300 border border-white/10"
          title="Download Episode"
        >
          <Download className="w-4 h-4" />
        </button>

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

  return (
    <>
      {showDownload && <DownloadModal />}
      
      {isMobile ? (
        <div className="w-full overflow-x-auto scrollbar-hide pb-8 pt-2 -mx-4 px-4">
          <div className="flex gap-4 w-max">
            {episodes.map(ep => (
              <div key={ep.id} className="w-[280px]">
                <EpisodeCard episode={ep} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full pb-10">
          {episodes.map(ep => (
            <EpisodeCard key={ep.id} episode={ep} />
          ))}
        </div>
      )}
    </>
  );
}
