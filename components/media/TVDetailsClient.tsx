'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Star, ChevronLeft, Download } from 'lucide-react';
import { MediaDetails, Genre } from '@/lib/api/types';
import { tmdbApi } from '@/lib/api/tmdb';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';
import SeasonSelector from './SeasonSelector';
import EpisodeRow from './EpisodeRow';
import CastList from './CastList';

interface TVDetailsClientProps {
  tv: MediaDetails;
  genres: Genre[];
  seasons: any[];
  cast?: any[];
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
  poster: 'w780',
} as const;

export default function TvShowDetailsClient({ tv, genres, seasons, cast = [] }: TVDetailsClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [currentEpisodes, setCurrentEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsInWatchlist(watchlistStorage.isInWatchlist(tv.id, 'tv'));
    setIsLiked(likedStorage.isLiked(tv.id, 'tv'));
  }, [tv.id]);

  useEffect(() => {
    const initSeason = seasons.find(s => s.season_number === 1) || seasons[0];
    if (initSeason) {
      setSelectedSeasonNumber(initSeason.season_number);
      setCurrentEpisodes(initSeason.episodes || []);
    }
  }, [seasons]);

  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeasonNumber(seasonNum);
    setLoadingEpisodes(true);
    const existing = seasons.find(s => s.season_number === seasonNum);
    if (existing?.episodes) {
      setCurrentEpisodes(existing.episodes);
      setLoadingEpisodes(false);
      return;
    }
    try {
      const seasonData = await tmdbApi.getTVSeasonDetails(tv.id, seasonNum);
      setCurrentEpisodes(seasonData.episodes || []);
    } catch (err) {
      console.error('Failed to fetch season', err);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const toggleWatchlist = () => {
    if (isInWatchlist) watchlistStorage.removeFromWatchlist(tv.id, 'tv');
    else watchlistStorage.addToWatchlist({ id: tv.id, name: tv.name, poster_path: tv.poster_path, media_type: 'tv', vote_average: tv.vote_average || 0, first_air_date: tv.first_air_date });
    setIsInWatchlist(!isInWatchlist);
    window.dispatchEvent(new CustomEvent('watchlist-updated'));
  };

  const toggleLike = () => {
    if (isLiked) likedStorage.removeFromLiked(tv.id, 'tv');
    else likedStorage.addToLiked({ id: tv.id, name: tv.name, poster_path: tv.poster_path, media_type: 'tv', vote_average: tv.vote_average || 0, first_air_date: tv.first_air_date });
    setIsLiked(!isLiked);
    window.dispatchEvent(new CustomEvent('liked-updated'));
  };

  const buildImage = (path: string | null, size: string) => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-movie.jpg';

  const formatYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';

  // ========================
  // MOBILE LAYOUT
  // ========================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#050505] pb-20 overflow-hidden">
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="p-2 bg-black/30 backdrop-blur-md rounded-full text-white border border-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        {/* Colorful Ambient Background */}
        <div className="fixed inset-0 -z-10 h-screen w-full">
          <Image 
            src={buildImage(tv.poster_path, 'w780')} 
            alt="bg" 
            fill 
            className="object-cover opacity-60 blur-[80px] scale-150" 
            priority 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#050505]/60 to-[#050505]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 pt-24">
          <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-white/10 mb-6">
            <Image src={buildImage(tv.poster_path, 'w780')} alt={tv.name} fill className="object-cover" priority />
          </div>

          <h1 className="text-3xl font-bold text-white text-center font-chillax mb-3 leading-tight drop-shadow-lg">{tv.name}</h1>
          
          <div className="flex items-center justify-center flex-wrap gap-3 text-xs text-gray-200 font-medium mb-8">
            <span className="bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">{formatYear(tv.first_air_date)}</span>
            <span className="bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm">{tv.number_of_seasons} Seasons</span>
            <span className="flex items-center gap-1 text-yellow-400 bg-white/10 px-2 py-1 rounded-md backdrop-blur-sm"><Star className="w-3 h-3 fill-current" /> {tv.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-3 mb-8 w-full justify-center max-w-sm">
            <Link href={`/watch/tv/${tv.id}?season=1&episode=1`} className="flex-1 h-12 bg-white text-black rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-transform">
              <Play className="w-5 h-5 fill-black" />
              <span>Play</span>
            </Link>
            <button onClick={toggleWatchlist} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 backdrop-blur-md ${isInWatchlist ? 'bg-green-500 border-green-500 text-white' : 'bg-white/10 border-white/20 text-white'}`}>
              <Plus className={`w-5 h-5 ${isInWatchlist ? 'rotate-45' : ''}`} />
            </button>
            <button onClick={toggleLike} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 backdrop-blur-md ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/20 text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="w-full flex items-center justify-between mb-4 px-2">
            <h3 className="text-lg font-bold text-white font-chillax">Episodes</h3>
            <SeasonSelector seasons={seasons} currentSeason={selectedSeasonNumber} onSelect={handleSeasonChange} />
          </div>

          <div className="w-full min-h-[200px] mb-8">
            {loadingEpisodes ? (
              <div className="flex gap-4 overflow-hidden px-2">
                {[1,2].map(i => <div key={i} className="w-[280px] aspect-video bg-white/10 rounded-xl animate-pulse flex-shrink-0" />)}
              </div>
            ) : (
              <EpisodeRow episodes={currentEpisodes} onPlay={(ep) => window.location.href = `/watch/tv/${tv.id}?season=${selectedSeasonNumber}&episode=${ep.episode_number}`} />
            )}
          </div>

          <div className="w-full max-w-full overflow-hidden">
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
        {/* 1. Base Image scaled & blurred for COLOR */}
        <Image 
          src={buildImage(tv.backdrop_path, 'original')} 
          alt="backdrop color source" 
          fill 
          className="object-cover opacity-50 blur-[100px] scale-110" 
          priority 
        />
        
        {/* 2. Texture/Detail Overlay (subtle) */}
        <Image 
          src={buildImage(tv.backdrop_path, 'original')} 
          alt="backdrop texture" 
          fill 
          className="object-cover opacity-20 blur-md mix-blend-overlay" 
        />

        {/* 3. Gradients for Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-[#050505]/70" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 pt-8 flex gap-12 items-start min-h-screen pb-20">
        
        {/* Vertical Card */}
        <div className="hidden md:block w-[320px] lg:w-[380px] flex-shrink-0 sticky top-28 h-fit">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/10 group bg-black/20 backdrop-blur-sm">
            <Image 
              src={buildImage(tv.poster_path, 'w780')} 
              alt={tv.name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
              priority 
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 pb-20 min-w-0">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 text-sm font-medium bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-5xl lg:text-7xl font-extrabold font-chillax leading-[1.05] mb-6 drop-shadow-2xl">
            {tv.name}
          </h1>

          <div className="flex items-center gap-4 mb-8 text-sm text-gray-200 font-medium flex-wrap">
            <span className="text-white font-semibold">{formatYear(tv.first_air_date)}</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="bg-white/10 border border-white/10 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold">TV-MA</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span>{tv.number_of_seasons} Seasons</span>
            <span className="w-1 h-1 bg-white/30 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400 font-semibold bg-black/20 px-2 py-1 rounded-md"><Star className="w-4 h-4 fill-current" /> {tv.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-4 mb-10 flex-wrap">
            <Link href={`/watch/tv/${tv.id}?season=1&episode=1`} className="h-14 px-10 bg-white text-black rounded-xl flex items-center gap-3 font-bold text-lg hover:bg-gray-200 transition-all hover:scale-[1.02] shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <Play className="w-6 h-6 fill-black" />
              Start Watching
            </Link>

            <button className="h-14 px-8 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl flex items-center gap-3 font-semibold hover:bg-white/10 transition-all">
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
              {tv.overview}
            </p>
          </div>

          <div className="mb-12 max-w-full overflow-hidden">
            <CastList cast={cast} />
          </div>

          {/* Episodes Section */}
          <div className="w-full pb-12">
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <h3 className="text-2xl font-bold text-white font-chillax drop-shadow-md">Episodes</h3>
              <SeasonSelector seasons={seasons} currentSeason={selectedSeasonNumber} onSelect={handleSeasonChange} />
            </div>

            <div className="w-full">
              {loadingEpisodes ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-white/10 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                <EpisodeRow episodes={currentEpisodes} onPlay={(ep) => window.location.href = `/watch/tv/${tv.id}?season=${selectedSeasonNumber}&episode=${ep.episode_number}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
