'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Check, Star } from 'lucide-react';
import { Movie, Genre } from '@/lib/api/types';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';
import { cn } from '@/lib/utils'; // Assuming you have a cn utility, if not I'll inline it

interface MediaCardProps {
  media: Movie;
  genres: Genre[];
  priority?: boolean;
  mediaType: 'movie' | 'tv';
  className?: string;
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
  className,
}: MediaCardProps) {
  const [inWatch, setInWatch] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Helper to build image URL
  const buildImage = (backdrop: string | null, poster: string | null) => {
    if (backdrop) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.backdrop}${backdrop}`;
    if (poster) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.poster}${poster}`;
    return '/placeholder-movie.jpg'; // Ensure this asset exists
  };

  // Sync state with local storage
  useEffect(() => {
    setInWatch(watchlistStorage.isInWatchlist(media.id, mediaType));
    setLiked(likedStorage.isLiked(media.id, mediaType));

    const handleUpdate = () => {
      setInWatch(watchlistStorage.isInWatchlist(media.id, mediaType));
      setLiked(likedStorage.isLiked(media.id, mediaType));
    };

    window.addEventListener('watchlist-updated', handleUpdate);
    window.addEventListener('liked-updated', handleUpdate);
    return () => {
      window.removeEventListener('watchlist-updated', handleUpdate);
      window.removeEventListener('liked-updated', handleUpdate);
    };
  }, [media.id, mediaType]);

  const toggleWatch = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = {
      id: media.id,
      title: mediaType === 'movie' ? media.title : media.name,
      name: mediaType === 'tv' ? media.name : undefined,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      media_type: mediaType,
      vote_average: media.vote_average ?? 0,
      release_date: mediaType === 'movie' ? media.release_date : undefined,
      first_air_date: mediaType === 'tv' ? media.first_air_date : undefined,
    };

    if (inWatch) {
      watchlistStorage.removeFromWatchlist(media.id, mediaType);
    } else {
      watchlistStorage.addToWatchlist(item);
    }
    setInWatch(!inWatch);
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = { ...media, media_type: mediaType }; // Simplified for brevity

    if (liked) {
      likedStorage.removeFromLiked(media.id, mediaType);
    } else {
      likedStorage.addToLiked(item);
    }
    setLiked(!liked);
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  const title = mediaType === 'movie' ? media.title : media.name;
  const date = mediaType === 'movie' ? media.release_date : media.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null;

  return (
    <div
      className={`group relative w-[260px] md:w-[320px] flex-shrink-0 snap-start ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${mediaType}/${media.id}`} className="block h-full">
        {/* Card Container */}
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#111] border border-white/5 shadow-md transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] group-hover:border-white/20">
          
          {/* Image */}
          <Image
            src={buildImage(media.backdrop_path, media.poster_path)}
            alt={title || 'Media'}
            fill
            sizes="(max-width: 768px) 260px, 320px"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />

          {/* Vignette Overlay (Subtle) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          {/* Hover Overlay (Darkens image for text readability) */}
          <div 
            className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center gap-3 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Play Button (Primary) */}
            <Link
              href={`/watch/${mediaType}/${media.id}`}
              onClick={(e) => e.stopPropagation()}
              className="group/play flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-xl transition-transform duration-300 hover:scale-110 active:scale-95"
            >
              <Play className="ml-1 h-5 w-5 fill-current" />
            </Link>

            {/* Action Buttons (Secondary) */}
            <div className="flex gap-2">
              <button
                onClick={toggleWatch}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  inWatch
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-white/30 bg-black/40 text-white hover:bg-white hover:text-black'
                }`}
                title={inWatch ? "Remove from Watchlist" : "Add to Watchlist"}
              >
                {inWatch ? <Check className="h-4 w-4" /> : <Plus className="h-5 w-5" />}
              </button>

              <button
                onClick={toggleLike}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 ${
                  liked
                    ? 'border-rose-500 bg-rose-500 text-white'
                    : 'border-white/30 bg-black/40 text-white hover:bg-white hover:text-black'
                }`}
                title={liked ? "Unlike" : "Like"}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Top Right Badge (Rating) */}
          {rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md border border-white/10 shadow-sm">
              <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
        </div>

        {/* Text Info (Below Card) */}
        <div className="mt-3 px-1">
          <h3 className="font-chillax text-base font-semibold leading-tight text-gray-100 transition-colors group-hover:text-blue-400 line-clamp-1">
            {title}
          </h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400 font-medium">
            {year && <span>{year}</span>}
            <span className="h-1 w-1 rounded-full bg-gray-600" />
            <span className="uppercase tracking-wider">{mediaType === 'movie' ? 'Movie' : 'TV Show'}</span>
            {genres && genres.length > 0 && (
              <>
                <span className="h-1 w-1 rounded-full bg-gray-600" />
                <span className="truncate max-w-[120px]">{genres[0].name}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
