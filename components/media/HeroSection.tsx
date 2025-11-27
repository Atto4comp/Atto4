// components/media/HeroSection.tsx

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Play, Info } from 'lucide-react';
import { Movie } from '@/lib/api/types';

interface HeroSectionProps {
  media: Movie[];
  genres?: { id: number; name: string }[];
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
  backdropMobile: 'w1280',
  poster: 'w780',
} as const;

export default function HeroSection({ media, genres = [] }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const buildTmdbImage = (path: string | null, size: string = 'original'): string => {
    if (!path) return '/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  useEffect(() => {
    if (!isAutoPlaying || media.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, media.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  if (!media || media.length === 0) return null;
  const currentMovie = media[currentIndex];

  // Desktop Layout
  return (
    // ✅ REMOVED "pt-16" or "mt-16" here. "top-0" ensures it starts at the very top.
    <div className="relative w-full h-[85vh] min-h-[700px] max-h-[900px] overflow-hidden top-0">
      <div className="absolute inset-0">
        {media.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={buildTmdbImage(movie.backdrop_path, TMDB_IMAGE_SIZES.backdrop)}
              alt={movie.title || 'Movie backdrop'}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="100vw"
              quality={100}
            />
          </div>
        ))}
        {/* Adjusted gradient to be smoother at the top */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && !isMobile && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/10 hover:scale-110 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/10 hover:scale-110 group"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-end">
        <div className="w-full max-w-[1400px] mx-auto px-8 pb-32">
          <div className="max-w-3xl space-y-6">
            {/* Title with modern typography */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight drop-shadow-2xl font-chillax">
              {currentMovie.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex items-center gap-3 text-sm font-medium">
              {currentMovie.release_date && (
                <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
              )}
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg border border-yellow-500/20 flex items-center gap-1">
                ★ {currentMovie.vote_average?.toFixed(1)}
              </span>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                Movie
              </span>
            </div>

            {/* Overview with better readability */}
            {currentMovie.overview && (
              <p className="text-gray-200 text-lg leading-relaxed line-clamp-3 max-w-2xl drop-shadow-md font-light">
                {currentMovie.overview}
              </p>
            )}

            {/* Modern Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href={`/watch/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-white text-black font-bold px-8 py-4 rounded-2xl hover:scale-105 transition-transform shadow-[0_0_40px_-10px_rgba(255,255,255,0.6)]"
              >
                <Play className="w-5 h-5 fill-black" />
                Watch Now
              </Link>
              <Link
                href={`/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all border border-white/10"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Pagination Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-10 right-10 z-20 flex gap-3">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' 
                  : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
