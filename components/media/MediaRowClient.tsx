// components/media/MediaRow.tsx (and/or MediaRowClient.tsx)

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
  const rowRef = useRef<HTMLDivElement | null>(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  
  // ✅ FIXED: Hardcoded a better vertical position relative to the container
  // Instead of dynamic calc which can be buggy, we'll use a % that works better visually
  // top-1/2 of the scroll container usually works best.

  const getScrollAmount = () => {
    if (!scrollRef.current) return 300;
    const width = scrollRef.current.clientWidth;
    return Math.max(280, Math.round(width * 0.8));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;

    setShowLeftArrow(scrollLeft > 10); // slightly higher threshold prevents flicker
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, [items]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = getScrollAmount();

    el.scrollBy({
      left: dir === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!items?.length) return null;

  return (
    <div className="relative mb-12 group/row" ref={rowRef}>

      {/* HEADER */}
      <div className="flex items-end justify-between px-4 md:px-8 mb-3 md:mb-4">
        <h2 className="text-lg md:text-2xl font-bold text-white font-chillax tracking-wide">
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

      {/* ARROWS - NOW VISIBLE ON MOBILE & BETTER POSITIONED */}
      {/* Using absolute positioning relative to the ROW, pushing them up into the card area */}
      <div className="absolute top-[60%] md:top-[55%] left-0 right-0 w-full -translate-y-1/2 z-20 pointer-events-none px-2 md:px-4">
        <div className="flex justify-between w-full">
          
          {/* Left Arrow */}
          <div className="pointer-events-auto">
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="bg-black/60 backdrop-blur-md border border-white/10 text-white p-2 md:p-3 rounded-full hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg md:opacity-0 md:group-hover/row:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            )}
          </div>

          {/* Right Arrow */}
          <div className="pointer-events-auto">
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="bg-black/60 backdrop-blur-md border border-white/10 text-white p-2 md:p-3 rounded-full hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg md:opacity-0 md:group-hover/row:opacity-100"
              >
                <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto pb-4 px-4 md:px-8 snap-x snap-mandatory hide-scrollbar scroll-smooth"
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
        {/* Spacer at the end to ensure last item isn't cut off */}
        <div className="w-4 md:w-8 flex-shrink-0" />
      </div>

      {/* Inline Style to guarantee scrollbar hiding */}
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
