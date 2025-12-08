// components/layout/ActivitySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, X, Play, Sparkles } from 'lucide-react';
import { progressStorage } from '@/lib/storage/progress';

export default function ActivitySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load Data
  const loadData = async () => {
    const watched = progressStorage.getHistory();
    setHistory(watched);

    if (watched.length > 0) {
      setLoading(true);
      const lastItem = watched[0];
      try {
        // Client-side fetch for recommendations based on last watched
        const res = await fetch(
          `https://api.themoviedb.org/3/${lastItem.mediaType}/${lastItem.id}/recommendations?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await res.json();
        setSuggestions(data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initial load
    loadData();

    // Listen for history updates
    window.addEventListener('history-updated', loadData);
    
    // ✅ Listen for Toggle Event from Header
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-activity-view', handleToggle);

    return () => {
      window.removeEventListener('history-updated', loadData);
      window.removeEventListener('toggle-activity-view', handleToggle);
    };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel - Slides from Right */}
      <div className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-[#0f0f0f] border-l border-white/10 z-[9999] shadow-2xl transform transition-transform duration-300 ease-out ${
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

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          
          {/* 1. Continue Watching Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <History size={12} />
                Continue Watching
              </h3>
            </div>
            
            {history.length === 0 ? (
              <div className="p-4 rounded-xl bg-white/5 text-center text-sm text-gray-500">
                No watch history yet. Start streaming!
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <Link 
                    key={`${item.mediaType}-${item.id}`}
                    href={`/watch/${item.mediaType}/${item.id}${item.mediaType === 'tv' ? `?season=${item.season}&episode=${item.episode}` : ''}`}
                    onClick={() => setIsOpen(false)}
                    className="flex gap-4 group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all"
                  >
                    {/* Thumbnail Placeholder */}
                    <div className="relative w-28 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                       <div className="absolute inset-0 flex items-center justify-center bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                          <Play className="w-8 h-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" fill="currentColor" />
                       </div>
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h4>
                      {item.mediaType === 'tv' && (
                        <p className="text-xs text-gray-400 mt-1">
                          S{item.season} : E{item.episode}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-600 mt-2">
                        Resume where you left off
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* 2. Suggestions Section */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={12} />
                Suggested Picks
              </h3>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600 text-xs animate-pulse">Curating list...</div>
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {suggestions.slice(0, 6).map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`}
                    onClick={() => setIsOpen(false)}
                    className="relative aspect-[2/3] rounded-xl overflow-hidden group border border-white/5 bg-gray-900"
                  >
                    {item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title || item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                       <span className="text-xs font-bold text-white line-clamp-2">{item.title || item.name}</span>
                       <span className="text-[10px] text-green-400 mt-0.5">{Math.round(item.vote_average * 10)}% Match</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
               <div className="p-4 rounded-xl bg-white/5 text-center text-sm text-gray-500">
                Watch more content to get personalized picks!
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
