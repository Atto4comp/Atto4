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

  const SCROLL_AMOUNT = 800;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    const handleResize = () => handleScroll();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  if (!items?.length) return null;

  return (
    <div className="relative mb-16 group/row">
      
      {/* Header */}
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

      {/* Navigation Arrows - Fixed positioning with high z-index */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 top-[calc(50%+1.25rem)] -translate-y-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/20 text-white p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 hover:bg-white hover:text-black shadow-xl pointer-events-auto"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 top-[calc(50%+1.25rem)] -translate-y-1/2 z-50 bg-black/80 backdrop-blur-md border border-white/20 text-white p-3 rounded-full opacity-0 group-hover/row:opacity-100 transition-all hover:scale-110 hover:bg-white hover:text-black shadow-xl pointer-events-auto"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto scrollbar-hide px-4 md:px-12 pb-8 snap-x snap-mandatory relative"
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
        
        <div className="w-8 flex-shrink-0" />
      </div>
    </div>
  );
}
