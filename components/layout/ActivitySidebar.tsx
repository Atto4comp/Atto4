// components/layout/ActivitySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, X, Play, Sparkles } from 'lucide-react';
import { progressStorage, WatchHistoryItem } from '@/lib/storage/progress';

interface EnrichedHistoryItem extends WatchHistoryItem {
  backdrop_path?: string | null;
  poster_path?: string | null;
  vote_average?: number;
}

export default function ActivitySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<EnrichedHistoryItem[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch full details for a single item from TMDB to get images
  const fetchItemDetails = async (item: WatchHistoryItem): Promise<EnrichedHistoryItem> => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${item.mediaType}/${item.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
      );
      const data = await res.json();
      return {
        ...item,
        backdrop_path: data.backdrop_path,
        poster_path: data.poster_path,
        vote_average: data.vote_average,
      };
    } catch (err) {
      console.error('Failed to fetch item details:', err);
      return item; // Return original item if fetch fails (will use fallback placeholder)
    }
  };

  const loadData = async () => {
    const watched = progressStorage.getHistory();
    
    // Enrich history items with TMDB data (images)
    const enrichedHistory = await Promise.all(
      watched.map(item => fetchItemDetails(item))
    );
    
    setHistory(enrichedHistory);

    // Fetch recommendations based on the last watched item
    if (enrichedHistory.length > 0) {
      setLoading(true);
      const lastItem = enrichedHistory[0];
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${lastItem.mediaType}/${lastItem.id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('history-updated', loadData);
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-activity-view', handleToggle);
    return () => {
      window.removeEventListener('history-updated', loadData);
      window.removeEventListener('toggle-activity-view', handleToggle);
    };
  }, []);

  // Helper to build TMDB image URLs
  const getImageUrl = (path: string | null | undefined, size: 'w342' | 'w780' = 'w342') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-[#0a0a0a] border-l border-white/10 z-[9999] shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold font-chillax text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            For You
          </h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          {/* Continue Watching Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <History size={12} />
                Continue Watching
              </h3>
            </div>
            
            {history.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 text-center text-sm text-gray-500 border border-white/5">
                No watch history yet. Start streaming!
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 6).map((item) => {
                  const thumbnailUrl = getImageUrl(item.backdrop_path || item.poster_path, 'w342');
                  
                  return (
                    <Link 
                      key={`${item.mediaType}-${item.id}`}
                      href={`/watch/${item.mediaType}/${item.id}${item.mediaType === 'tv' ? `?season=${item.season}&episode=${item.episode}` : ''}`}
                      onClick={() => setIsOpen(false)}
                      className="flex gap-4 group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all"
                    >
                      {/* Thumbnail with Play Overlay (No Progress Bar) */}
                      <div className="relative w-28 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                        {thumbnailUrl ? (
                          <Image 
                            src={thumbnailUrl} 
                            alt={item.title} 
                            fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            sizes="112px"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                            <Play className="w-8 h-8 text-white/20" />
                          </div>
                        )}
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-blue-500/20 transition-colors">
                          <Play className="w-8 h-8 text-white/80 group-hover:text-white group-hover:scale-110 transition-all drop-shadow-lg" fill="currentColor" />
                        </div>
                      </div>
                      
                      {/* Text Info */}
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h4>
                        {item.mediaType === 'tv' && (
                          <p className="text-xs text-gray-400 mt-1">
                            S{item.season} : E{item.episode}
                          </p>
                        )}
                        <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Resume
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {/* Suggested Picks Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} />
                Suggested Picks
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600 text-xs animate-pulse">
                Curating list...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {suggestions.slice(0, 6).map((item) => {
                  const posterUrl = getImageUrl(item.poster_path, 'w342');
                  
                  return (
                    <Link 
                      key={item.id} 
                      href={`/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`}
                      onClick={() => setIsOpen(false)}
                      className="relative aspect-[2/3] rounded-xl overflow-hidden group border border-white/5 bg-gray-900 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      {posterUrl ? (
                        <Image
                          src={posterUrl}
                          alt={item.title || item.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="160px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-700 text-xs">
                          No Image
                        </div>
                      )}
                      
                      {/* Info Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <span className="text-xs font-bold text-white line-clamp-2">
                          {item.title || item.name}
                        </span>
                        {item.vote_average && (
                          <span className="text-[10px] text-green-400 mt-0.5">
                            {Math.round(item.vote_average * 10)}% Match
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-white/5 text-center text-sm text-gray-500 border border-white/5">
                Watch more content to get personalized picks!
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
