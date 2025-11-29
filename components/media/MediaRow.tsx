'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const SCROLL_AMOUNT = 800; // Scroll roughly one screen width

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
      
      current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // 10px tolerance
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [items]);

  if (!items?.length) return null;

  return (
    <div className="relative mb-16 group/row">
      
      {/* Header - Aligned with container padding */}
      {/* Added explicit padding-left matching the scroll container to fix alignment */}
      <div className="flex items-end justify-between px-4 md:px-12 mb-5">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-chillax tracking-wide drop-shadow-md">
          {title}
        </h2>
        
        <Link
          href={`/browse/${category}?type=${mediaType}`}
          className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1 group/link"
        >
          Explore All
          <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Navigation Arrows (Desktop Only) */}
      {/* Moved arrows INSIDE the relative container but absolute positioned to overlay the ends correctly */}
      <div className="hidden md:block pointer-events-none absolute inset-0 px-4 md:px-12">
        <div className="relative h-full w-full">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className={`absolute -left-5 top-[55%] -translate-y-1/2 z-30 bg-black/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-full transition-all shadow-lg pointer-events-auto ${
              showLeftArrow 
                ? 'opacity-0 group-hover/row:opacity-100 hover:scale-110 hover:bg-white hover:text-black' 
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className={`absolute -right-5 top-[55%] -translate-y-1/2 z-30 bg-black/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-full transition-all shadow-lg pointer-events-auto ${
              showRightArrow 
                ? 'opacity-0 group-hover/row:opacity-100 hover:scale-110 hover:bg-white hover:text-black' 
                : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start flex-shrink-0">
            <MediaCard
              media={item}
              genres={genres}
              priority={priority}
              mediaType={mediaType}
            />
          </div>
        ))}
        
        {/* End Padding Spacer */}
        <div className="w-8 flex-shrink-0" />
      </div>
    </div>
  );
}
