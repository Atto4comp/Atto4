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
  const [arrowVertical, setArrowVertical] = useState('50%');

  // Calculate scroll amount dynamically
  const getScrollAmount = () => {
    if (!scrollRef.current) return 340 * 2;
    const width = scrollRef.current.clientWidth;
    return Math.max(340, Math.round(width * 0.8));
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;

    setShowLeftArrow(scrollLeft > 5);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const updateArrowPosition = () => {
    if (!rowRef.current) return;

    const row = rowRef.current;
    const computedHeight = row.offsetHeight;
    const center = Math.max(160, computedHeight / 2); // keeps arrows vertically centered no matter layout

    setArrowVertical(`${center}px`);
  };

  useEffect(() => {
    handleScroll();
    updateArrowPosition();

    window.addEventListener('resize', updateArrowPosition);

    return () => window.removeEventListener('resize', updateArrowPosition);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = getScrollAmount();
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!items?.length) return null;

  return (
    <div className="relative mb-12 group/row" ref={rowRef}>
      
      {/* HEADER */}
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

      {/* ARROWS — Now inside row container and aligned */}
      <div className="hidden md:block">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="absolute z-20 left-8 bg-black/40 backdrop-blur-md border border-white/10 text-white p-3 rounded-full opacity-90 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
            style={{
              top: arrowVertical,
              transform: 'translateY(-50%)'
            }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="absolute z-20 right-8 bg-black/40 backdrop-blur-md border border-white/10 text-white p-3 rounded-full opacity-90 hover:bg-white hover:text-black hover:scale-110 transition-all shadow-lg"
            style={{
              top: arrowVertical,
              transform: 'translateY(-50%)'
            }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* SCROLL CONTAINER */}
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

        {/* Spacer for smooth scroll ending */}
        <div className="w-16 flex-shrink-0" />
      </div>
    </div>
  );
}
