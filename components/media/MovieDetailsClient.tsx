'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Star, Download, Share2, ChevronLeft, Clock, Calendar } from 'lucide-react';
import { MediaDetails, Genre } from '@/lib/api/types';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';
import CastList from './CastList';

interface MovieDetailsClientProps {
  movie: MediaDetails;
  genres: Genre[];
  cast?: any[];
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
  poster: 'w780',
  posterSmall: 'w500',
} as const;

export default function MovieDetailsClient({ movie, genres, cast = [] }: MovieDetailsClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const buildImage = (path: string | null, size: string) => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-movie.jpg';

  useEffect(() => {
    setIsInWatchlist(watchlistStorage.isInWatchlist(movie.id, 'movie'));
    setIsLiked(likedStorage.isLiked(movie.id, 'movie'));
  }, [movie.id]);

  const toggleWatchlist = () => {
    if (isInWatchlist) watchlistStorage.removeFromWatchlist(movie.id, 'movie');
    else watchlistStorage.addToWatchlist({ 
      id: movie.id, title: movie.title, poster_path: movie.poster_path, 
      media_type: 'movie', vote_average: movie.vote_average || 0, 
      release_date: movie.release_date 
    });
    setIsInWatchlist(!isInWatchlist);
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  const toggleLike = () => {
    if (isLiked) likedStorage.removeFromLiked(movie.id, 'movie');
    else likedStorage.addToLiked({ 
      id: movie.id, title: movie.title, poster_path: movie.poster_path, 
      media_type: 'movie', vote_average: movie.vote_average || 0, 
      release_date: movie.release_date 
    });
    setIsLiked(!isLiked);
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  // ✅ New Download Handler
  const handleDownload = () => {
    const downloadUrl = `https://dl.vidsrc.vip/movie/${movie.id}`;
    
    // Create hidden iframe to trigger download without navigation
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    
    // Optional: Clean up iframe after a delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 60000); // Remove after 1 minute
  };

  const formatYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';
  const formatRuntime = (min?: number) => min ? `${Math.floor(min / 60)}h ${min % 60}m` : 'N/A';

  // ========================
  // MOBILE LAYOUT
  // ========================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20 overflow-hidden">
        {/* Back Button */}
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Vibrant Ambient Background */}
        <div className="fixed inset-0 -z-10 h-screen w-full">
          {/* Primary Color Source: Massive Blur of Poster */}
          <Image 
            src={buildImage(movie.poster_path, 'w780')} 
            alt="bg" 
            fill 
            className="object-cover opacity-60 blur-[80px] scale-150" 
            priority 
          />
          {/* Gradient Overlays for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#050505]/60 to-[#050505]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-24">
          
          {/* Vertical Poster Card */}
          <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 mb-8 transform">
            <Image src={buildImage(movie.poster_path, 'w780')} alt={movie.title} fill className="object-cover" priority />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center font-chillax mb-3 leading-tight drop-shadow-lg">{movie.title}</h1>
          
          {/* Meta Row */}
          <div className="flex items-center justify-center flex-wrap gap-3 text-xs text-gray-200 font-medium mb-8">
            <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm"><Calendar className="w-3 h-3" /> {formatYear(movie.release_date)}</span>
            <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm"><Clock className="w-3 h-3" /> {formatRuntime(movie.runtime)}</span>
            <span className="flex items-center gap-1 text-yellow-400 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm"><Star className="w-3 h-3 fill-current" /> {movie.vote_average.toFixed(1)}</span>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-4 gap-4 w-full max-w-sm mb-8">
            <Link href={`/watch/movie/${movie.id}`} className="col-span-4 bg-white text-black h-12 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-gray-200 active:scale-95 transition-all">
              <Play className="w-5 h-5 fill-black" />
              <span>Play Now</span>
            </Link>
            
            <button onClick={toggleWatchlist} className={`col-span-1 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 backdrop-blur-md ${isInWatchlist ? 'bg-green-500 border-green-500 text-white' : 'bg-white/10 border-white/20 text-white'}`}>
              <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
            </button>

            <button onClick={toggleLike} className={`col-span-1 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 backdrop-blur-md ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/20 text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button 
              onClick={handleDownload}
              className="col-span-1 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-95"
            >
              <Download className="w-5 h-5" />
            </button>

            <button className="col-span-1 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Overview */}
          <p className="text-gray-200 text-sm leading-relaxed text-center line-clamp-4 mb-8 max-w-md font-light drop-shadow-md">
            {movie.overview}
          </p>

          {/* Cast List */}
          <div className="w-full max-w-md overflow-hidden">
            <CastList cast={cast} />
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // DESKTOP LAYOUT
  // ========================
  return (
    <div className="relative min-h-screen bg-[#050505] text-white pt-20">
      
      {/* Vibrant Ambient Background Layer */}
      <div className="fixed inset-0 h-screen w-full -z-10 overflow-hidden">
        {/* 1. Base Image scaled & heavily blurred to extract colors */}
        <Image 
          src={buildImage(movie.backdrop_path, 'original')} 
          alt="backdrop color source" 
          fill 
          className="object-cover opacity-50 blur-[100px] scale-110" 
          priority 
        />
        
        {/* 2. Sharp Overlay for Texture (Optional, kept subtle) */}
        <Image 
          src={buildImage(movie.backdrop_path, 'original')} 
          alt="texture" 
          fill 
          className="object-cover opacity-20 blur-md mix-blend-overlay" 
        />

        {/* 3. Gradient Masks to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        
        {/* 4. Vignette to focus center */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505]/80" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 pt-8 flex gap-12 items-start min-h-screen pb-20">
        
        {/* Left: Floating Vertical Poster Card */}
        <div className="hidden md:block w-[320px] lg:w-[380px] flex-shrink-0 sticky top-28 h-fit">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 group bg-black/20 backdrop-blur-sm">
            <Image 
              src={buildImage(movie.poster_path, 'w780')} 
              alt={movie.title} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority 
            />
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Right: Info & Actions */}
        <div className="flex-1 pb-20 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-5xl lg:text-7xl font-extrabold font-chillax leading-[1.05] mb-6 drop-shadow-2xl">
            {movie.title}
          </h1>

          <div className="flex items-center gap-4 mb-8 text-sm text-gray-200 font-medium flex-wrap">
            <span className="text-white font-semibold">{formatYear(movie.release_date)}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="bg-white/10 border border-white/10 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold">HD</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span>{formatRuntime(movie.runtime)}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400 font-semibold bg-black/20 px-2 py-1 rounded-md"><Star className="w-4 h-4 fill-current" /> {movie.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-4 mb-10 flex-wrap">
            <Link 
              href={`/watch/movie/${movie.id}`} 
              className="h-14 px-10 bg-white text-black rounded-xl flex items-center gap-3 font-bold text-lg hover:bg-gray-200 transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <Play className="w-6 h-6 fill-black" />
              Play Now
            </Link>

            <button 
              onClick={handleDownload}
              className="h-14 px-8 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl flex items-center gap-3 font-semibold hover:bg-white/10 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <div className="flex gap-3">
              <button onClick={toggleWatchlist} className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all hover:scale-105 backdrop-blur-xl ${isInWatchlist ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
              </button>
              <button onClick={toggleLike} className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all hover:scale-105 backdrop-blur-xl ${isLiked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-white mb-3 font-chillax drop-shadow-md">Storyline</h3>
            <p className="text-lg text-gray-200 leading-relaxed max-w-4xl font-light drop-shadow-md">
              {movie.overview}
            </p>
          </div>

          {genres && genres.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-12">
              {genres.slice(0, 5).map(g => (
                <span key={g.id} className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white/50">
                  #{g.name}
                </span>
              ))}
            </div>
          )}

          <div className="w-full max-w-full overflow-hidden">
            <CastList cast={cast} />
          </div>
        </div>
      </div>
    </div>
  );
}
