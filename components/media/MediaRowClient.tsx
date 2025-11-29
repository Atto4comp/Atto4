'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie, TVShow } from '@/lib/api/types';
import MediaCard from './MediaCard';

type Media = Movie | TVShow;
type RowKind = 'movie' | 'tv';

interface Props {
  title?: string;
  media: Media[];
  mediaType?: RowKind;
  limit?: number;
}

export default function MediaRowClient({ 
  title = 'Featured', 
  media = [], 
  mediaType = 'movie', 
  limit = 12 
}: Props) {
  const visible = media.slice(0, limit);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollerRef.current) return;
    const el = scrollerRef.current;
    const offset = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === 'left' ? -offset : offset, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollerRef.current) return;
    const el = scrollerRef.current;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  if (!visible.length) return null;

  return (
    <section className="relative mb-16 group/row">
      {/* Header - Consistent Padding */}
      <div className="flex items-center justify-between px-4 md:px-12 mb-5">
        <h3 className="text-2xl md:text-3xl font-bold font-chillax text-white tracking-wide drop-shadow-md">
          {title}
        </h3>
        
        {/* Desktop Manual Controls */}
        <div className="hidden md:flex gap-2">
          <button 
            onClick={() => scroll('left')}
            disabled={!showLeftArrow}
            className="p-2 rounded-full border border-white/10 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            disabled={!showRightArrow}
            className="p-2 rounded-full border border-white/10 hover:bg-white hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex gap-5 overflow-x-auto px-4 md:px-12 pb-8 scrollbar-hide snap-x snap-mandatory"
      >
        {visible.map((m) => (
          <div key={(m as any).id} className="snap-start flex-shrink-0">
            <MediaCard 
              media={m as Movie} 
              genres={[]} 
              mediaType={mediaType || 'movie'} 
            />
          </div>
        ))}
        <div className="w-8 flex-shrink-0" />
      </div>
    </section>
  );
}
