// components/media/MediaGrid.tsx

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';

type MediaItem = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  overview?: string;
};

interface Props {
  items: MediaItem[];
  mediaType: 'movie' | 'tv' | 'mixed';
  loading?: boolean;
}

export default function MediaGrid({ items, mediaType, loading }: Props) {

  const getItemTitle = (item: MediaItem) => item.title || item.name || 'Untitled';

  const getItemYear = (item: MediaItem) => {
    const date = item.release_date || item.first_air_date;
    return date ? new Date(date).getFullYear() : null;
  };

  const formatRating = (rating?: number) => {
    if (!rating || rating === 0) return null;
    return rating.toFixed(1);
  };

  const getItemHref = (item: MediaItem) => {
    if (mediaType === 'mixed') {
      const type = item.media_type || (item.title ? 'movie' : 'tv');
      return `/${type}/${item.id}`;
    }
    return `/${mediaType}/${item.id}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] skeleton-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (!items?.length) {
    return (
      <div className="text-center py-24">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03]">
          <span className="text-2xl opacity-40">🎬</span>
        </div>
        <p className="text-white/48 text-sm">No content available</p>
        <p className="text-white/24 text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
      {items.map((item) => {
        const title = getItemTitle(item);
        const year = getItemYear(item);
        const rating = formatRating(item.vote_average);
        const href = getItemHref(item);

        const posterUrl = item.poster_path
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
          : item.backdrop_path
            ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
            : null;

        return (
          <Link key={`${item.id}-${item.media_type || mediaType}`} href={href} className="group block">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0e] shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_12px_28px_rgba(0,0,0,0.4)]">

              {/* Image */}
              <Image
                src={posterUrl || '/placeholder-movie.jpg'}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 20vw, 16vw"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/48 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-250">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110">
                  <Play className="ml-0.5 h-4 w-4 fill-current" />
                </div>
              </div>

              {/* Rating Badge */}
              {rating && (
                <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-md bg-black/48 backdrop-blur-md px-1.5 py-0.5 border border-white/[0.06]">
                  <Star className="w-[9px] h-[9px] fill-[var(--accent-warm)] text-[var(--accent-warm)]" />
                  <span className="text-[9px] font-semibold text-white/72">{rating}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-2.5 px-0.5">
              <h3 className="font-display text-[13px] font-medium leading-tight tracking-tight text-white line-clamp-1">
                {title}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/36">
                {year && <span>{year}</span>}
                {year && rating && <span className="h-[3px] w-[3px] rounded-full bg-white/20" />}
                {rating && (
                  <span className="flex items-center gap-0.5 text-[var(--accent-warm)]">
                    <Star className="h-[9px] w-[9px] fill-[var(--accent-warm)] text-[var(--accent-warm)]" />
                    {rating}
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
