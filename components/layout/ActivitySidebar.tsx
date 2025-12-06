// components/layout/ActivitySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { History, X, Play, ChevronRight } from 'lucide-react';
import { progressStorage } from '@/lib/storage/progress';
import { tmdbApi } from '@/lib/api/tmdb'; // You'll need a client-side fetch wrapper or use server actions?
// Actually, for simplicity, suggestions might need to be fetched client-side or passed as static props.
// Let's assume we fetch suggestions client-side for now.

export default function ActivitySidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load History & Generate Suggestions
  useEffect(() => {
    const loadData = async () => {
      const watched = progressStorage.getHistory();
      setHistory(watched);

      if (watched.length > 0) {
        setLoading(true);
        // Simple algorithm: Take the last watched item and fetch recommendations for it
        const lastItem = watched[0];
        try {
          const res = await fetch(`/api/recommendations?id=${lastItem.id}&type=${lastItem.mediaType}`);
          const data = await res.json();
          setSuggestions(data.results || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();

    // Listen for updates
    window.addEventListener('history-updated', loadData);
    return () => window.removeEventListener('history-updated', loadData);
  }, []);

  // Don't show button if no history
  if (history.length === 0) return null;

  return (
    <>
      {/* Floating Trigger Button (Right Side) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-blue-600 text-white p-3 rounded-l-xl shadow-2xl transition-transform duration-300 hover:bg-blue-500 hover:pr-4 group ${
          isOpen ? 'translate-x-full' : 'translate-x-0'
        }`}
        aria-label="Activity"
      >
        <History className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>

      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-[400px] max-w-[90vw] bg-[#0f0f0f] border-l border-white/10 z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold font-chillax text-white flex items-center gap-2">
            <History className="w-5 h-5 text-blue-500" />
            Activity & Picks
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100vh-80px)]">
          
          {/* Section: Continue Watching */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Continue Watching</h3>
            </div>
            
            <div className="space-y-4">
              {history.slice(0, 4).map((item) => (
                <Link 
                  key={`${item.mediaType}-${item.id}`}
                  href={`/watch/${item.mediaType}/${item.id}${item.mediaType === 'tv' ? `?season=${item.season}&episode=${item.episode}` : ''}`}
                  className="flex gap-4 group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/50 hover:bg-white/10 transition-all"
                >
                  {/* Thumbnail Placeholder (since we might not have images yet) */}
                  <div className="relative w-24 h-14 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                     {/* Ideally we load the actual backdrop here if stored */}
                     <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                        <Play className="w-6 h-6 text-white/50 group-hover:text-white transition-colors" />
                     </div>
                  </div>
                  
                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    {item.mediaType === 'tv' && (
                      <p className="text-xs text-gray-500 mt-1">
                        S{item.season} : E{item.episode}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-600 mt-1">
                      {new Date(item.lastWatched).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Section: Suggested For You */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Based on your history</h3>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-600 text-xs">Finding gems...</div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {suggestions.slice(0, 4).map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/${item.media_type || 'movie'}/${item.id}`}
                    className="relative aspect-[2/3] rounded-lg overflow-hidden group border border-white/5"
                  >
                    {item.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title || item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                       <span className="text-xs font-bold text-white line-clamp-1">{item.title || item.name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
