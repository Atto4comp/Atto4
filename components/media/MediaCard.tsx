'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Star } from 'lucide-react';
import { Movie, Genre } from '@/lib/api/types';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';

interface MediaCardProps {
  media: Movie;
  genres: Genre[];
  priority?: boolean;
  mediaType: 'movie' | 'tv';
}

// ✅ Landscape size for modern horizontal cards
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
  const [hover, setHover] = useState(false);
  const [inWatch, setInWatch] = useState(false);
  const [liked, setLiked] = useState(false);

  const buildImage = (backdrop: string | null, poster: string | null) => {
    if (backdrop) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.backdrop}${backdrop}`;
    if (poster) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.poster}${poster}`;
    return '/placeholder-movie.jpg';
  };

  useEffect(() => {
    setInWatch(watchlistStorage.isInWatchlist(media.id, mediaType));
    setLiked(likedStorage.isLiked(media.id, mediaType));
  }, [media.id, mediaType]);

  const toggleWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: media.id,
      title: mediaType === 'movie' ? media.title : media.name,
      name: mediaType === 'tv' ? media.name : undefined,
      poster_path: media.poster_path,
      media_type: mediaType,
      vote_average: media.vote_average ?? 0,
      release_date: mediaType === 'movie' ? media.release_date : undefined,
      first_air_date: mediaType === 'tv' ? media.first_air_date : undefined,
    };

    if (inWatch) watchlistStorage.removeFromWatchlist(media.id, mediaType);
    else watchlistStorage.addToWatchlist(item);
    
    setInWatch(!inWatch);
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: media.id,
      title: mediaType === 'movie' ? media.title : media.name,
      name: mediaType === 'tv' ? media.name : undefined,
      poster_path: media.poster_path,
      media_type: mediaType,
      vote_average: media.vote_average ?? 0,
      release_date: mediaType === 'movie' ? media.release_date : undefined,
      first_air_date: mediaType === 'tv' ? media.first_air_date : undefined,
    };

    if (liked) likedStorage.removeFromLiked(media.id, mediaType);
    else likedStorage.addToLiked(item);
    
    setLiked(!liked);
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  const title = mediaType === 'movie' ? media.title : media.name;
  const date = mediaType === 'movie' ? media.release_date : media.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;

  return (
    <div
      className="group cursor-pointer w-[280px] sm:w-[320px] flex-shrink-0"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/${mediaType}/${media.id}`}>
        
        {/* 1. Image Container (16:9) */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <Image
            src={buildImage(media.backdrop_path, media.poster_path)}
            alt={title || 'Media'}
            fill
            sizes="(max-width: 768px) 280px, 320px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradient Overlay (Subtle) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Rating Badge (Top Right) */}
          {media.vote_average > 0 && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-white">{media.vote_average.toFixed(1)}</span>
            </div>
          )}

          {/* Hover Actions Overlay */}
          <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${hover ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            
            <Link
              href={`/watch/${mediaType}/${media.id}`}
              className="relative z-10 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </Link>

            <button
              onClick={toggleWatch}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                inWatch ? 'bg-green-500 border-green-500 text-white' : 'bg-black/50 border-white/30 text-white hover:bg-white hover:text-black'
              }`}
            >
              <Plus className={`w-5 h-5 transition-transform ${inWatch ? 'rotate-45' : ''}`} />
            </button>

            <button
              onClick={toggleLike}
              className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all border ${
                liked ? 'bg-red-500 border-red-500 text-white' : 'bg-black/50 border-white/30 text-white hover:bg-white hover:text-black'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* 2. Title & Meta Info (Below Image) */}
        <div className="mt-3 px-1">
          <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-1 font-chillax group-hover:text-blue-400 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-medium">
            {year && <span>{year}</span>}
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="uppercase tracking-wide">{mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
          </div>
        </div>

      </Link>
    </div>
  );
}
