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
  cast?: any[]; // Add cast prop
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
  };

  const toggleLike = () => {
    if (isLiked) likedStorage.removeFromLiked(movie.id, 'movie');
    else likedStorage.addToLiked({ 
      id: movie.id, title: movie.title, poster_path: movie.poster_path, 
      media_type: 'movie', vote_average: movie.vote_average || 0, 
      release_date: movie.release_date 
    });
    setIsLiked(!isLiked);
  };

  const formatYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';
  const formatRuntime = (min?: number) => min ? `${Math.floor(min / 60)}h ${min % 60}m` : 'N/A';

  // ========================
  // MOBILE LAYOUT (Android Compact Style)
  // ========================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-20">
        {/* Back Button */}
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Background Blur */}
        <div className="absolute inset-0 h-[65vh] w-full overflow-hidden">
          <Image src={buildImage(movie.poster_path, 'w500')} alt="bg" fill className="object-cover opacity-30 blur-2xl scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center px-6 pt-28">
          
          {/* Vertical Poster Card */}
          <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-8 transform hover:scale-105 transition-transform duration-500">
            <Image src={buildImage(movie.poster_path, 'w780')} alt={movie.title} fill className="object-cover" priority />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white text-center font-chillax mb-3 leading-tight">{movie.title}</h1>
          
          {/* Meta Row */}
          <div className="flex items-center justify-center flex-wrap gap-3 text-xs text-gray-300 font-medium mb-8 opacity-90">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatYear(movie.release_date)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatRuntime(movie.runtime)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-current" /> {movie.vote_average.toFixed(1)}</span>
          </div>

          {/* Primary Actions */}
          <div className="grid grid-cols-4 gap-4 w-full max-w-sm mb-8">
            <Link href={`/watch/movie/${movie.id}`} className="col-span-4 bg-white text-black h-12 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg hover:bg-gray-200 active:scale-95 transition-all">
              <Play className="w-5 h-5 fill-black" />
              <span>Play Now</span>
            </Link>
            
            <button onClick={toggleWatchlist} className={`col-span-1 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${isInWatchlist ? 'bg-green-500 border-green-500 text-white' : 'bg-white/5 border-white/10 text-white'}`}>
              <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
            </button>

            <button onClick={toggleLike} className={`col-span-1 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/5 border-white/10 text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button className="col-span-1 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white active:scale-95">
              <Download className="w-5 h-5" />
            </button>

            <button className="col-span-1 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Overview */}
          <p className="text-gray-300 text-sm leading-relaxed text-center line-clamp-4 mb-8 max-w-md font-light">
            {movie.overview}
          </p>

          {/* Cast List */}
          <CastList cast={cast} />
        </div>
      </div>
    );
  }

  // ========================
  // DESKTOP LAYOUT (Modern Floating Card)
  // ========================
  return (
    // Negative margin pulls it up behind the transparent navbar
    <div className="relative min-h-screen bg-[#050505] text-white -mt-[4rem]">
      
      {/* Ambient Background Layer */}
      <div className="absolute inset-0 h-[100vh] w-full overflow-hidden">
        {/* Blurred Backdrop */}
        <Image 
          src={buildImage(movie.backdrop_path, 'original')} 
          alt="backdrop" 
          fill 
          className="object-cover opacity-40 blur-md scale-105" 
          priority 
        />
        
        {/* Complex Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 pt-[18vh] flex gap-12 items-start">
        
        {/* Left: Floating Vertical Poster Card */}
        <div className="hidden md:block w-[350px] flex-shrink-0">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
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
        <div className="flex-1 pt-4">
          {/* Breadcrumb / Back */}
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          {/* Title */}
          <h1 className="text-6xl lg:text-7xl font-extrabold font-chillax leading-[1.1] mb-4 drop-shadow-2xl tracking-tight">
            {movie.title}
          </h1>

          {/* Minimal Meta Row */}
          <div className="flex items-center gap-4 mb-8 text-sm text-gray-300 font-medium">
            <span className="text-white">{formatYear(movie.release_date)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs">HD</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{formatRuntime(movie.runtime)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400"><Star className="w-4 h-4 fill-current" /> {movie.vote_average.toFixed(1)}</span>
          </div>

          {/* Modern Rectangular Action Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <Link 
              href={`/watch/movie/${movie.id}`} 
              className="h-14 px-10 bg-white text-black rounded-xl flex items-center gap-3 font-bold text-lg hover:bg-gray-200 transition-all hover:scale-[1.02] shadow-lg"
            >
              <Play className="w-6 h-6 fill-black" />
              Play Now
            </Link>

            <button className="h-14 px-8 bg-white/10 backdrop-blur-md border border-white/10 text-white rounded-xl flex items-center gap-3 font-semibold hover:bg-white/20 transition-all">
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>

            <div className="flex gap-2 ml-2">
              <button onClick={toggleWatchlist} className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all hover:scale-105 ${isInWatchlist ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
              </button>
              <button onClick={toggleLike} className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all hover:scale-105 ${isLiked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Overview */}
          <h3 className="text-lg font-bold text-white mb-2 font-chillax">Storyline</h3>
          <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl font-light">
            {movie.overview}
          </p>

          {/* Minimal Genres (Just text tags) */}
          <div className="flex flex-wrap gap-3 mb-10">
            {genres.slice(0, 4).map(g => (
              <span key={g.id} className="text-sm text-gray-400 border-b border-transparent hover:text-white hover:border-white transition-all cursor-pointer">
                #{g.name}
              </span>
            ))}
          </div>

          {/* Cast List (Desktop) */}
          <div className="max-w-4xl">
            <CastList cast={cast} />
          </div>
        </div>
      </div>
    </div>
  );
}
