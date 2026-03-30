'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Genre, Movie } from '@/lib/api/types';
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
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 8);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 8);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.78;
    rowRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="section-shell relative mb-8 md:mb-14">
      {/* Section Header */}
      <div className="mb-3 md:mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-[1rem] md:text-2xl font-semibold tracking-tight text-white">
          {title}
        </h2>

        <Link
          href={`/browse/${category}?type=${mediaType}`}
          className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.16em] text-white/36 transition-colors hover:text-white/64 md:text-[11px] md:normal-case md:tracking-normal"
        >
          <span className="hidden md:inline">See all</span>
          <ArrowRight className="h-3.5 w-3.5 md:h-3 md:w-3" />
        </Link>
      </div>

      {/* Scroll Area */}
      <div className="group/scroll relative">
        {/* Left Arrow (desktop) */}
        <button
          onClick={() => scroll('left')}
          className={`absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-lg border border-white/[0.08] bg-[rgba(5,5,7,0.9)] p-2 text-white/48 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-white/[0.08] hover:text-white md:block ${
            showLeftArrow ? 'opacity-0 group-hover/scroll:opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="hide-scrollbar flex snap-x snap-mandatory gap-2.5 md:gap-3 overflow-x-auto pb-2 pt-1 scroll-smooth md:edge-fade"
        >
          {items.map((item, index) => (
            <MediaCard
              key={item.id}
              media={item}
              genres={genres}
              priority={priority && index < 4}
              mediaType={mediaType}
            />
          ))}
          {/* Peek spacer */}
          <div className="w-2 md:w-0 flex-shrink-0" />
        </div>

        {/* Right Arrow (desktop) */}
        <button
          onClick={() => scroll('right')}
          className={`absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 rounded-lg border border-white/[0.08] bg-[rgba(5,5,7,0.9)] p-2 text-white/48 shadow-md backdrop-blur-md transition-all duration-200 hover:bg-white/[0.08] hover:text-white md:block ${
            showRightArrow ? 'opacity-0 group-hover/scroll:opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
