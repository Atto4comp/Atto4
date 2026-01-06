'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Movie, Genre } from '@/lib/api/types';
import MediaCard from './MediaCard';

interface MediaRowProps {
  title: string;
  items: Movie[];
  genres: Genre[];
  priority?: boolean;
  category?: string;
  mediaType: 'movie' | 'tv';
}

export default function MediaRow({
  title,
  items,
  genres,
  priority = false,
  category = 'popular',
  mediaType,
}: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.8;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative mb-12 md:mb-16 group/row animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between px-6 md:px-12">
        <div>
          <h2 className="font-chillax text-xl md:text-2xl font-bold text-white tracking-wide">
            {title}
          </h2>
          <div className="mt-1 h-1 w-12 rounded-full bg-blue-500/80" />
        </div>

        <Link
          href={`/browse/${category}?type=${mediaType}`}
          className="group flex items-center gap-1 text-sm font-medium text-gray-400 transition-colors hover:text-white"
        >
          <span className="hidden sm:inline">View All</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Row Container */}
      <div className="relative group/arrows">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center transition-opacity duration-300 ${
            showLeftArrow
              ? 'opacity-0 group-hover/arrows:opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
        </button>

        {/* Cards Scroller (✅ Adjusted padding to align thumbnails) */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 -mt-2 overflow-x-auto scroll-smooth px-6 md:px-12 pb-4 hide-scrollbar snap-x snap-mandatory"
        >
          {items.map((item, i) => (
            <MediaCard
              key={item.id}
              media={item}
              genres={genres}
              priority={priority && i < 4}
              mediaType={mediaType}
            />
          ))}
          {/* Spacer to allow scrolling the last item fully into view */}
          <div className="w-6 md:w-12 flex-shrink-0" />
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center transition-opacity duration-300 ${
            showRightArrow
              ? 'opacity-0 group-hover/arrows:opacity-100'
              : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" />
        </button>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
