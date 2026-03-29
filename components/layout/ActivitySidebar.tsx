// components/layout/ActivitySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
      return item;
    }
  };

  const loadData = async () => {
    const watched = progressStorage.getHistory();
    
    const enrichedHistory = await Promise.all(
      watched.map(item => fetchItemDetails(item))
    );
    
    setHistory(enrichedHistory);

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

  const getImageUrl = (path: string | null | undefined, size: 'w342' | 'w780' = 'w342') => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/56 backdrop-blur-sm z-[9998]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            className="fixed top-0 right-0 h-full w-[380px] max-w-[88vw] border-l border-white/[0.06] bg-[#06060a] z-[9999] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
              <h2 className="font-display text-base font-semibold text-white/88 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                For You
              </h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1.5 rounded-md text-white/28 hover:text-white/56 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-5 space-y-8 overflow-y-auto h-[calc(100vh-64px)] hide-scrollbar">
              
              {/* Continue Watching */}
              <section>
                <h3 className="text-[10px] font-semibold text-white/24 uppercase tracking-[0.16em] flex items-center gap-1.5 mb-3">
                  <History size={10} />
                  Continue Watching
                </h3>
                
                {history.length === 0 ? (
                  <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-6 text-center text-[12px] text-white/28">
                    No watch history yet. Start streaming!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 6).map((item) => {
                      const thumbnailUrl = getImageUrl(item.backdrop_path || item.poster_path, 'w342');
                      
                      return (
                        <Link 
                          key={`${item.mediaType}-${item.id}`}
                          href={`/watch/${item.mediaType}/${item.id}${item.mediaType === 'tv' ? `?season=${item.season}&episode=${item.episode}` : ''}`}
                          onClick={() => setIsOpen(false)}
                          className="flex gap-3 group p-2.5 rounded-lg border border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all"
                        >
                          {/* Thumbnail */}
                          <div className="relative w-24 aspect-video bg-[#0a0a0e] rounded-md overflow-hidden flex-shrink-0">
                            {thumbnailUrl ? (
                              <Image 
                                src={thumbnailUrl} 
                                alt={item.title} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="96px"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Play className="w-5 h-5 text-white/16" />
                              </div>
                            )}
                            
                            {/* Play overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/32 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-5 h-5 text-white/80" fill="currentColor" />
                            </div>
                          </div>
                          
                          {/* Info */}
                          <div className="flex flex-col justify-center min-w-0">
                            <h4 className="text-[12px] font-medium text-white/72 truncate group-hover:text-white transition-colors">
                              {item.title}
                            </h4>
                            {item.mediaType === 'tv' && (
                              <p className="text-[10px] text-white/28 mt-0.5">
                                S{item.season} · E{item.episode}
                              </p>
                            )}
                            <p className="text-[9px] text-white/20 mt-1.5 flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                              Resume
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Suggested Picks */}
              <section>
                <h3 className="text-[10px] font-semibold text-white/24 uppercase tracking-[0.16em] flex items-center gap-1.5 mb-3">
                  <Sparkles size={10} />
                  Suggested Picks
                </h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="relative h-6 w-6 mx-auto">
                      <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
                      <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-[var(--accent)]" />
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {suggestions.slice(0, 6).map((item) => {
                      const posterUrl = getImageUrl(item.poster_path, 'w342');
                      
                      return (
                        <Link 
                          key={item.id} 
                          href={`/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`}
                          onClick={() => setIsOpen(false)}
                          className="relative aspect-[2/3] rounded-lg overflow-hidden group border border-white/[0.04] bg-[#0a0a0e]"
                        >
                          {posterUrl ? (
                            <Image
                              src={posterUrl}
                              alt={item.title || item.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="120px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/12 text-[9px]">
                              No Image
                            </div>
                          )}
                          
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            <span className="text-[10px] font-medium text-white/88 line-clamp-2 leading-tight">
                              {item.title || item.name}
                            </span>
                            {item.vote_average && (
                              <span className="text-[8px] text-[var(--accent)] mt-0.5">
                                {Math.round(item.vote_average * 10)}% Match
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-4 py-6 text-center text-[12px] text-white/28">
                    Watch more to get personalized picks!
                  </div>
                )}
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
