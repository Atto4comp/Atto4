'use client';

import { useState, useRef, useEffect } from 'react';
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
      // Buffer of 10px to hide arrow when close to end
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of view width
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="relative mb-14 md:mb-20 group/row">
      {/* Header - Strictly aligned with content padding */}
      <div className="flex items-end justify-between px-6 md:px-12 mb-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl md:text-3xl font-bold text-white font-chillax tracking-tight">
            {title}
          </h2>
          {/* Optional: Tiny accent line to anchor the title visually */}
          <div className="h-1 w-10 bg-blue-600 rounded-full opacity-80" />
        </div>

        <Link
          href={`/browse/${category}?type=${mediaType}`}
          className="group flex items-center gap-1.5 text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors py-1"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Row Container */}
      <div className="relative group/arrows">
        {/* Navigation Arrows (Full height hover zones) */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-black/90 via-black/40 to-transparent flex items-center justify-start pl-4 transition-opacity duration-300 ${
            showLeftArrow ? 'opacity-0 group-hover/arrows:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-8 h-8 text-white drop-shadow-md hover:scale-110 transition-transform" />
        </button>

        <button
          onClick={() => scroll('right')}
          className={`absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-black/90 via-black/40 to-transparent flex items-center justify-end pr-4 transition-opacity duration-300 ${
            showRightArrow ? 'opacity-0 group-hover/arrows:opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-8 h-8 text-white drop-shadow-md hover:scale-110 transition-transform" />
        </button>

        {/* Scrollable Area */}
        {/* Added explicit padding (px-6 md:px-12) to match header exactly */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex gap-4 md:gap-5 overflow-x-auto pb-8 pt-2 px-6 md:px-12 scroll-smooth hide-scrollbar snap-x snap-mandatory"
        >
          {items.map((item, i) => (
            <div key={item.id} className="snap-start flex-shrink-0">
              <MediaCard
                media={item}
                genres={genres}
                priority={priority && i < 4}
                mediaType={mediaType}
              />
            </div>
          ))}
          
          {/* Right spacer to prevent last item being stuck against edge */}
          <div className="w-6 md:w-12 flex-shrink-0" />
        </div>
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
