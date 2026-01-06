'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Check, Heart, Star } from 'lucide-react';
import { Movie, Genre } from '@/lib/api/types';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';

interface MediaCardProps {
  media: Movie;
  genres: Genre[];
  priority?: boolean;
  mediaType: 'movie' | 'tv';
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'w780',
  poster: 'w500',
} as const;

export default function MediaCard({
  media,
  genres,
  priority = false,
  mediaType,
}: MediaCardProps) {
  const [inWatch, setInWatch] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const buildImage = (backdrop: string | null, poster: string | null) => {
    if (backdrop) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.backdrop}${backdrop}`;
    if (poster) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.poster}${poster}`;
    return '/placeholder.jpg';
  };

  useEffect(() => {
    const updateState = () => {
      setInWatch(watchlistStorage.isInWatchlist(media.id, mediaType));
      setLiked(likedStorage.isLiked(media.id, mediaType));
    };

    updateState();
    window.addEventListener('watchlist-updated', updateState);
    window.addEventListener('liked-updated', updateState);
    return () => {
      window.removeEventListener('watchlist-updated', updateState);
      window.removeEventListener('liked-updated', updateState);
    };
  }, [media.id, mediaType]);

  const toggleWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { ...media, media_type: mediaType };
    
    if (inWatch) watchlistStorage.removeFromWatchlist(media.id, mediaType);
    else watchlistStorage.addToWatchlist(item);
    
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { ...media, media_type: mediaType };

    if (liked) likedStorage.removeFromLiked(media.id, mediaType);
    else likedStorage.addToLiked(item);

    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  const title = mediaType === 'movie' ? media.title : media.name;
  const year = (media.release_date || media.first_air_date)?.split('-')[0];
  const genreName = genres.find(g => media.genre_ids?.includes(g.id))?.name;

  return (
    // Fixed width container - removed ml-3 to fix alignment
    <div 
      className="group relative w-[280px] md:w-[340px] flex-shrink-0 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${mediaType}/${media.id}`}>
        
        {/* Image Container - 16:9 Aspect Ratio */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5 shadow-md transition-all duration-300 group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-blue-900/10">
          
          <Image
            src={buildImage(media.backdrop_path, media.poster_path)}
            alt={title || 'Media'}
            fill
            sizes="(max-width: 768px) 280px, 340px"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Gradient Overlay - Always there but subtle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {/* Hover Actions Overlay */}
          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-300 flex items-center justify-center gap-3 ${isHovered ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            
            <button
              onClick={toggleWatch}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-95 ${inWatch ? 'bg-green-500 border-green-500 text-white' : 'bg-black/40 border-white/30 text-white hover:bg-white hover:text-black'}`}
              title="Watchlist"
            >
              {inWatch ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>

            <Link
              href={`/watch/${mediaType}/${media.id}`}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 active:scale-95 transition-transform"
            >
              <Play className="w-6 h-6 ml-1 fill-current" />
            </Link>

            <button
              onClick={toggleLike}
              className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110 active:scale-95 ${liked ? 'bg-rose-500 border-rose-500 text-white' : 'bg-black/40 border-white/30 text-white hover:bg-white hover:text-black'}`}
              title="Like"
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Rating Badge - Top Right */}
          {media.vote_average > 0 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10 shadow-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-[10px] font-bold text-white">{media.vote_average.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Text Details - Below image for clean look */}
        <div className="mt-3 px-1">
          <h3 className="font-chillax text-base font-semibold text-white leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 font-medium">
            {year && <span>{year}</span>}
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span className="uppercase tracking-wider">{mediaType === 'movie' ? 'Movie' : 'TV'}</span>
            {genreName && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-600" />
                <span className="text-gray-500 truncate max-w-[120px]">{genreName}</span>
              </>
            )}
          </div>
        </div>

      </Link>
    </div>
  );
}
