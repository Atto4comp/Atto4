// components/media/MediaRowClient.tsx
'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { Movie, TVShow } from '@/lib/api/types';

type Media = Movie | TVShow;
type RowKind = 'movie' | 'tv';

interface Props {
  title?: string;
  media: Media[];
  mediaType?: RowKind;
  limit?: number;
}

// ✅ TMDB Image size constants
const TMDB_IMAGE_SIZES = {
  poster: 'w342',
  posterLarge: 'w500',
} as const;

export default function MediaRowClient({ 
  title = 'Featured', 
  media = [], 
  mediaType = 'movie', 
  limit = 12 
}: Props) {
  const visible = media.slice(0, limit);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // ✅ Build TMDB image URLs directly (no API key needed)
  const buildTmdbImage = (path: string | null, size: string = 'w342'): string => {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const el = scrollerRef.current;
    const offset = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollerRef.current) return;
    const el = scrollerRef.current;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  const getTitle = (item: Media): string => {
    return (item as Movie).title || (item as TVShow).name || 'Untitled';
  };

  const getReleaseYear = (item: Media): number | null => {
    const date = (item as Movie).release_date || (item as TVShow).first_air_date;
    return date ? new Date(date).getFullYear() : null;
  };

  if (!visible.length) {
    return (
      <section className="my-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        <div className="text-sm text-gray-400">No items to display</div>
      </section>
    );
  }

  return (
    <section className="my-6 relative group">
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <h3 className="text-xl md:text-2xl font-semibold text-white">{title}</h3>
        
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto py-2 px-4 sm:px-6 lg:px-8 scrollbar-hide scroll-smooth"
      >
        {visible.map((item) => {
          const itemTitle = getTitle(item);
          const year = getReleaseYear(item);
          const rating = item.vote_average;

          return (
            <Link
              key={item.id}
              href={`/${mediaType}/${item.id}`}
              className="group/card min-w-[160px] w-[160px] flex-shrink-0"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 shadow-lg group-hover/card:shadow-2xl transition-all duration-300 group-hover/card:scale-105">
                <Image
                  src={buildTmdbImage((item as any).poster_path, TMDB_IMAGE_SIZES.poster)}
                  alt={itemTitle}
                  fill
                  className="object-cover"
                  sizes="160px"
                />

                {/* Rating Badge */}
                {rating && rating > 0 && (
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {rating.toFixed(1)}
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-all duration-300" />
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-medium text-white line-clamp-2 group-hover/card:text-blue-400 transition-colors">
                  {itemTitle}
                </h4>
                {year && (
                  <p className="text-xs text-gray-400 mt-1">{year}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
