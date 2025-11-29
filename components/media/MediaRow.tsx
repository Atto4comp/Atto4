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

  const SCROLL_AMOUNT = 800; // Scroll by approx one screen width

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
      
      {/* Header - Perfectly aligned with padding-left/right matching scroll container */}
      <div className="flex items-end justify-between px-4 md:px-12 mb-5">
        <h2 className="text-2xl md:text-3xl font-bold text-white font-chillax tracking-wide drop-shadow-md">
          {title}
        </h2>
        
        <div className="flex items-center gap-4">
          <Link
            href={`/browse/${category}?type=${mediaType}`}
            className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1 group/link"
          >
            Explore All
            <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>

          {/* Desktop Navigation - inline with header for better UX */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!showLeftArrow}
              className={`p-2 rounded-full border border-white/10 transition-all ${
                showLeftArrow 
                  ? 'hover:bg-white hover:text-black cursor-pointer' 
                  : 'opacity-30 cursor-default'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!showRightArrow}
              className={`p-2 rounded-full border border-white/10 transition-all ${
                showRightArrow 
                  ? 'hover:bg-white hover:text-black cursor-pointer' 
                  : 'opacity-30 cursor-default'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
