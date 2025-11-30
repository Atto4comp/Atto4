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

  const getScrollAmount = () => {
    if (!scrollRef.current) return 300;
    const width = scrollRef.current.clientWidth;
    return Math.max(280, Math.round(width * 0.8));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;

    setShowLeftArrow(scrollLeft > 10);
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
    <div className="relative mb-10 md:mb-14 group/row" ref={rowRef}>

      {/* HEADER ROW */}
      <div className="flex items-center justify-between px-4 md:px-8 mb-3 md:mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg md:text-2xl font-bold text-white font-chillax tracking-wide">
            {title}
          </h2>

          {/* 📱 MOBILE ARROWS (Inline next to title) */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!showLeftArrow}
              className={`p-1.5 rounded-full border border-white/10 bg-white/5 ${
                !showLeftArrow ? 'opacity-30 cursor-not-allowed' : 'active:bg-white/20'
              }`}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!showRightArrow}
              className={`p-1.5 rounded-full border border-white/10 bg-white/5 ${
                !showRightArrow ? 'opacity-30 cursor-not-allowed' : 'active:bg-white/20'
              }`}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        <Link
          href={`/browse/${category}?type=${mediaType}`}
          className="text-xs md:text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <span className="hidden sm:inline">Explore All</span>
          <span className="sm:hidden">All</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* 🖥️ DESKTOP ARROWS (Floating Overlay) */}
      <div className="hidden md:block pointer-events-none absolute inset-0 z-20">
        <div className="relative w-full h-full">
          
          {/* Left Arrow - Reduced Size (p-2) */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              aria-label="Scroll left"
              className="pointer-events-auto absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 text-white p-2 rounded-full opacity-0 group-hover/row:opacity-100 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow - Reduced Size (p-2) */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              aria-label="Scroll right"
              className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/10 text-white p-2 rounded-full opacity-0 group-hover/row:opacity-100 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
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
        {/* Spacer to prevent cut-off */}
        <div className="w-4 md:w-8 flex-shrink-0" />
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
