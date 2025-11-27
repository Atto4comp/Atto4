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

  const getMovieGenres = (genreIds: number[]) => {
    if (!genreIds || !genres.length) return [];
    return genreIds
      .map((id) => genres.find((g) => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 3);
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
  const movieGenres = getMovieGenres(currentMovie.genre_ids || []);

  // Mobile Layout
  if (isMobile) {
    return (
      // ✅ FIXED: Removed pt-16, added top-0 and negative margin to pull it up
      <div className="relative w-full min-h-screen bg-black overflow-hidden top-0 -mt-16 sm:mt-0">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen p-4 pt-24">
          <div className="w-full max-w-sm">
            <div className="relative bg-gradient-to-b from-gray-800/50 to-gray-900/80 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <div className="relative aspect-[2/3] overflow-hidden">
                <Image
                  src={buildTmdbImage(currentMovie.poster_path, TMDB_IMAGE_SIZES.poster)}
                  alt={currentMovie.title || 'Movie poster'}
                  fill
                  className="object-cover"
                  priority
                  sizes="400px"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                
                {/* Mobile Metadata & Title */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-2xl font-extrabold text-white mb-2 leading-tight drop-shadow-lg font-chillax">
                    {currentMovie.title}
                  </h1>
                  {movieGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movieGenres.map((genre, idx) => (
                        <span key={idx} className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full border border-white/30">
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <Link
                    href={`/watch/movie/${currentMovie.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-black font-semibold py-3.5 px-4 rounded-xl transition-all shadow-lg"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>Play</span>
                  </Link>
                  <Link
                    href={`/movie/${currentMovie.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm text-white font-medium py-3.5 px-4 rounded-xl transition-all border border-white/20"
                  >
                    <Info className="w-4 h-4" />
                    <span>More Info</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    // ✅ FIXED: Added -mt-[4rem] to pull the hero section UP behind the header
    // The header is 4rem height, so we pull this up by 4rem.
    // Also ensured z-index is 0 so it sits BEHIND the navbar (z-50).
    <div className="relative w-full h-[100vh] min-h-[800px] overflow-hidden -mt-[4rem] z-0">
      
      {/* Background Image Layer */}
      <div className="absolute inset-0">
        {media.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
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
        
        {/* Gradient Overlays - Adjusted for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Top Gradient to darken behind navbar slightly for text readability if needed */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/5 group"
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8 opacity-70 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white p-4 rounded-full transition-all border border-white/5 group"
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </>
      )}

      {/* Hero Content */}
      <div className="relative z-10 h-full flex items-end pb-32">
        <div className="w-full max-w-[1600px] mx-auto px-8 md:px-16">
          <div className="max-w-4xl space-y-8">
            
            {/* Animated Title */}
            <h1 className="text-6xl md:text-8xl font-extrabold text-white leading-[0.9] tracking-tight drop-shadow-2xl font-chillax animate-in fade-in slide-in-from-bottom-10 duration-700">
              {currentMovie.title}
            </h1>

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-200">
              {currentMovie.release_date && (
                <span className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                  {new Date(currentMovie.release_date).getFullYear()}
                </span>
              )}
              <span className="bg-yellow-500/20 text-yellow-400 px-4 py-1.5 rounded-full border border-yellow-500/20 flex items-center gap-1.5">
                ★ {currentMovie.vote_average?.toFixed(1)}
              </span>
              {movieGenres.map((genre, i) => (
                <span key={i} className="bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">
                  {genre}
                </span>
              ))}
            </div>

            {/* Description */}
            {currentMovie.overview && (
              <p className="text-gray-300 text-lg md:text-xl leading-relaxed line-clamp-3 max-w-3xl drop-shadow-lg font-light">
                {currentMovie.overview}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-5 pt-4">
              <Link
                href={`/watch/movie/${currentMovie.id}`}
                className="group relative flex items-center gap-3 bg-white text-black font-bold px-10 py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Play className="w-6 h-6 fill-black" />
                <span className="text-lg">Watch Now</span>
              </Link>
              
              <Link
                href={`/movie/${currentMovie.id}`}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-xl text-white font-semibold px-10 py-4 rounded-full hover:bg-white/20 transition-all border border-white/10 hover:border-white/30"
              >
                <Info className="w-6 h-6" />
                <span className="text-lg">More Info</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-12 right-12 z-20 flex gap-3">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentIndex 
                  ? 'w-12 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                  : 'w-2 bg-white/20 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
