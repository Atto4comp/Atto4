'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, Heart, Play, Plus, Star } from 'lucide-react';
import { Genre, Movie } from '@/lib/api/types';
import { likedStorage, watchlistStorage } from '@/lib/storage/watchlist';
import { cn } from '@/lib/utils';

interface MediaCardProps {
  media: Movie;
  genres: Genre[];
  priority?: boolean;
  mediaType: 'movie' | 'tv';
  className?: string;
}

const TMDB_IMAGE_SIZES = {
  poster: 'w500',
} as const;

export default function MediaCard({
  media,
  genres,
  priority = false,
  mediaType,
  className,
}: MediaCardProps) {
  const router = useRouter();
  const [inWatch, setInWatch] = useState(false);
  const [liked, setLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const syncState = () => {
      setInWatch(watchlistStorage.isInWatchlist(media.id, mediaType));
      setLiked(likedStorage.isLiked(media.id, mediaType));
    };

    syncState();
    window.addEventListener('watchlist-updated', syncState);
    window.addEventListener('liked-updated', syncState);

    return () => {
      window.removeEventListener('watchlist-updated', syncState);
      window.removeEventListener('liked-updated', syncState);
    };
  }, [media.id, mediaType]);

  const buildImage = (poster: string | null) => {
    if (poster) return `https://image.tmdb.org/t/p/${TMDB_IMAGE_SIZES.poster}${poster}`;
    return '/placeholder-movie.jpg';
  };

  const toggleWatch = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const m = media as any;
    const item = {
      id: media.id,
      title: mediaType === 'movie' ? media.title : m.name,
      name: mediaType === 'tv' ? m.name : undefined,
      poster_path: media.poster_path,
      backdrop_path: media.backdrop_path,
      media_type: mediaType,
      vote_average: media.vote_average ?? 0,
      release_date: mediaType === 'movie' ? media.release_date : undefined,
      first_air_date: mediaType === 'tv' ? m.first_air_date : undefined,
    };

    if (inWatch) {
      watchlistStorage.removeFromWatchlist(media.id, mediaType);
    } else {
      watchlistStorage.addToWatchlist(item);
    }

    setInWatch(!inWatch);
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  const toggleLike = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const item = { ...media, media_type: mediaType };

    if (liked) {
      likedStorage.removeFromLiked(media.id, mediaType);
    } else {
      likedStorage.addToLiked(item);
    }

    setLiked(!liked);
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  const m = media as any;
  const title = mediaType === 'movie' ? media.title : m.name;
  const date = mediaType === 'movie' ? media.release_date : m.first_air_date;
  const year = date ? new Date(date).getFullYear() : null;
  const rating = media.vote_average ? media.vote_average.toFixed(1) : null;

  return (
    <div
      className={cn(
        'group relative flex-shrink-0 snap-start',
        'w-[var(--mobile-card-w)] sm:w-[160px] md:w-[190px]',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/${mediaType}/${media.id}`} className="block">
        <article className="overflow-hidden rounded-xl transition-all duration-300 md:group-hover:-translate-y-1.5 md:group-hover:drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)]">
          {/* Poster Image — 2:3 */}
          <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-white/[0.06] bg-[#0a0a0e] shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
            <Image
              src={buildImage(media.poster_path)}
              alt={title || 'Media'}
              fill
              sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 190px"
              priority={priority}
              className="object-cover transition-transform duration-500 md:group-hover:scale-[1.04]"
            />

            {/* Mobile: Rating badge top-right */}
            {rating && (
              <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-black/50 px-1.5 py-[2px] backdrop-blur-md md:hidden">
                <Star className="h-[8px] w-[8px] fill-[var(--accent-warm)] text-[var(--accent-warm)]" />
                <span className="text-[8px] font-semibold text-white/80">{rating}</span>
              </div>
            )}

            {/* Desktop: Hover overlay */}
            <div
              className={cn(
                'absolute inset-0 hidden md:flex flex-col items-center justify-center gap-2 bg-black/48 backdrop-blur-[2px] transition-all duration-250',
                isHovered ? 'opacity-100' : 'opacity-0'
              )}
            >
              {/* Play button */}
              <button
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  router.push(`/watch/${mediaType}/${media.id}`);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform duration-200 hover:scale-110"
                aria-label={`Watch ${title}`}
              >
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </button>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleWatch}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150',
                    inWatch
                      ? 'border-emerald-400/24 bg-emerald-500 text-black'
                      : 'border-white/12 bg-black/36 text-white/72 hover:bg-white/12'
                  )}
                  title={inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                >
                  {inWatch ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={toggleLike}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border transition-colors duration-150',
                    liked
                      ? 'border-rose-400/24 bg-rose-500 text-black'
                      : 'border-white/12 bg-black/36 text-white/72 hover:bg-white/12'
                  )}
                  title={liked ? 'Unlike' : 'Like'}
                >
                  <Heart className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
                </button>
              </div>
            </div>
          </div>

          {/* Card Info */}
          <div className="mt-2 px-0.5 md:mt-2.5">
            <h3 className="font-display text-[12px] md:text-[13px] font-medium leading-tight tracking-tight text-white line-clamp-1">
              {title}
            </h3>
            <div className="mt-0.5 md:mt-1 flex items-center gap-1.5 text-[10px] text-white/36">
              {year && <span>{year}</span>}
              {/* Desktop rating in info row */}
              {year && rating && <span className="hidden md:block h-[3px] w-[3px] rounded-full bg-white/20" />}
              {rating && (
                <span className="hidden md:flex items-center gap-0.5 text-[var(--accent-warm)]">
                  <Star className="h-[9px] w-[9px] fill-[var(--accent-warm)] text-[var(--accent-warm)]" />
                  {rating}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
}
