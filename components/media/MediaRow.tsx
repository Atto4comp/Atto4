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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // scroll by ~2 cards (responsive)
  const getScrollAmount = () => {
    const base = 336; // card + gap
    if (!scrollRef.current) return base * 2;
    const width = scrollRef.current.clientWidth;
    return Math.max(base, Math.round(width * 0.8));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  useEffect(() => {
    // Initial visibility check (wait for layout)
    const t = setTimeout(handleScroll, 50);
    window.addEventListener('resize', handleScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', handleScroll);
    };
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = getScrollAmount();
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!items?.length) return null;

  return (
    <div className="relative mb-12 group/row">
      {/* Header */}
      <div className="flex items-end justify-between section-padding mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-white font-chillax tracking-wide">
          {title}
        </h2>

        <Link
          href={`/browse/${category}?type=${mediaType}`}
          className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          Explore All
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Desktop arrows (positioned slightly outside the scroller) */}
      <div className="hidden md:block">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute -left-6 top-1/2 z-30 -translate-y-1/2 bg-black/40 backdrop-blur-md border border-white/10 text-white p-2 rounded-full opacity-90 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute -right-6 top-1/2 z-30 -translate-y-1/2 bg-black/40 backdrop-blur-md border border-white/10 text-white p-2 rounded-full opacity-90 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scroller */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto scrollbar-hide section-padding pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <MediaCard
              media={item}
              genres={genres}
              priority={priority}
              mediaType={mediaType}
            />
          </div>
        ))}

        {/* End spacer */}
        <div className="w-8 flex-shrink-0" />
      </div>
    </div>
  );
}
