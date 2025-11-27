// components/media/WatchlistRow.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Star, Play } from 'lucide-react';
import { watchlistStorage, WatchlistItem } from '@/lib/storage/watchlist';

const TMDB_IMAGE_SIZES = {
  backdrop: 'w780',
  poster: 'w500',
} as const;

export default function WatchlistRow() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const buildImage = (item: WatchlistItem) => {
    if (item.poster_path) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.backdrop}${item.poster_path}`;
    return '/placeholder-movie.jpg';
  };

  useEffect(() => {
    const loadWatchlist = () => {
      const items = watchlistStorage.getWatchlist();
      setWatchlist(items);
      setLoading(false);
    };
    loadWatchlist();
    const handleStorageChange = () => loadWatchlist();
    window.addEventListener('watchlist-updated', handleStorageChange);
    return () => window.removeEventListener('watchlist-updated', handleStorageChange);
  }, []);

  const handleRemove = (id: number, mediaType: 'movie' | 'tv', event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    watchlistStorage.removeFromWatchlist(id, mediaType);
    setWatchlist(prev => prev.filter(item => !(item.id === id && item.media_type === mediaType)));
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  if (loading) {
    return (
      <div className="mb-12 px-4 md:px-12">
        <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex-shrink-0 w-[280px] aspect-video bg-gray-900 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) return null;

  return (
    <div className="relative mb-12 group/row">
      <div className="px-4 md:px-12">
        <div className="flex items-end justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white font-chillax tracking-wide">My Watchlist</h2>
            <span className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              {watchlist.length}
            </span>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
          {watchlist.map((item) => {
            const title = item.media_type === 'movie' ? item.title : item.name;
            const releaseDate = item.media_type === 'movie' ? item.release_date : item.first_air_date;
            const year = releaseDate ? new Date(releaseDate).getFullYear() : null;

            return (
              <div key={`${item.media_type}-${item.id}`} className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] group/card">
                <Link href={`/${item.media_type}/${item.id}`} className="block">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 group-hover/card:border-white/20 group-hover/card:shadow-lg">
                    
                    <Image
                      src={buildImage(item)}
                      alt={title || 'Media'}
                      fill
                      className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                      sizes="(max-width: 768px) 280px, 320px"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                      <button
                        onClick={(e) => handleRemove(item.id, item.media_type, e)}
                        className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center hover:bg-green-500 hover:border-green-500 hover:scale-110 transition-all shadow-lg"
                        title="Mark as Watched"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <div className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 flex gap-2">
                      {item.vote_average > 0 && (
                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-lg flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[10px] font-bold text-white">{item.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-base leading-tight line-clamp-1 font-chillax group-hover/card:text-blue-400 transition-colors">
                        {title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        {year && <span>{year}</span>}
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span className="uppercase">{item.media_type === 'movie' ? 'Movie' : 'TV'}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          <div className="w-4 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
