// components/media/MediaCard.tsx

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
  backdrop: 'w780', // Landscape
  poster: 'w500',
} as const;


export default function MediaCard({
  media,
  genres,
  priority = false,
  mediaType,
}: MediaCardProps) {
  // ... state & logic remain same ...

  return (
    // ⬇️ CHANGED: Increased margin to ml-3 (12px) for better spacing
    <div
      className="relative group cursor-pointer w-[240px] sm:w-[280px] flex-shrink-0 ml-3"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* ... rest of the component remains exactly the same ... */}
      <Link href={`/${mediaType}/${media.id}`}>
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-300 group-hover:border-white/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          
          <Image
            src={buildImage(media.backdrop_path, media.poster_path)}
            alt={title || 'Media'}
            fill
            sizes="(max-width: 768px) 240px, 280px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

          {media.vote_average > 0 && (
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-white">{media.vote_average.toFixed(1)}</span>
            </div>
          )}

          <div className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300 ${hover ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
            
            <Link
              href={`/watch/${mediaType}/${media.id}`}
              className="relative z-10 w-9 h-9 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </Link>

            <button
              onClick={toggleWatch}
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
                inWatch ? 'bg-green-500 border-green-500 text-white' : 'bg-black/50 border-white/30 text-white hover:bg-white hover:text-black'
              }`}
            >
              <Plus className={`w-4 h-4 transition-transform ${inWatch ? 'rotate-45' : ''}`} />
            </button>

            <button
              onClick={toggleLike}
              className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all border ${
                liked ? 'bg-red-500 border-red-500 text-white' : 'bg-black/50 border-white/30 text-white hover:bg-white hover:text-black'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-white font-bold text-sm md:text-base leading-tight line-clamp-1 font-chillax group-hover:text-blue-400 transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs text-gray-400">
              {year && <span>{year}</span>}
              <span className="w-0.5 h-0.5 bg-gray-600 rounded-full" />
              <span className="uppercase">{mediaType === 'movie' ? 'Movie' : 'TV'}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

