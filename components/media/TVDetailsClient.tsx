'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Star, Share2, ChevronLeft } from 'lucide-react';
import { MediaDetails, Genre } from '@/lib/api/types';
import { tmdbApi } from '@/lib/api/tmdb';
import { watchlistStorage, likedStorage } from '@/lib/storage/watchlist';
import SeasonSelector from './SeasonSelector';
import EpisodeRow from './EpisodeRow';

interface TVDetailsClientProps {
  tv: MediaDetails;
  genres: Genre[];
  seasons: any[];
}

const TMDB_IMAGE_SIZES = {
  backdrop: 'original',
  poster: 'w780',
} as const;

export default function TvShowDetailsClient({ tv, genres, seasons }: TVDetailsClientProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  
  // State for dynamic season loading
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(1);
  const [currentEpisodes, setCurrentEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Detect Mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync Watchlist/Like
  useEffect(() => {
    setIsInWatchlist(watchlistStorage.isInWatchlist(tv.id, 'tv'));
    setIsLiked(likedStorage.isLiked(tv.id, 'tv'));
  }, [tv.id]);

  // Load Initial Episodes (Season 1 or first available)
  useEffect(() => {
    const initSeason = seasons.find(s => s.season_number === 1) || seasons[0];
    if (initSeason) {
      setSelectedSeasonNumber(initSeason.season_number);
      setCurrentEpisodes(initSeason.episodes || []);
    }
  }, [seasons]);

  // Handle Season Change
  const handleSeasonChange = async (seasonNum: number) => {
    setSelectedSeasonNumber(seasonNum);
    setLoadingEpisodes(true);
    
    // Check if we already have the data in props
    const existing = seasons.find(s => s.season_number === seasonNum);
    if (existing?.episodes) {
      setCurrentEpisodes(existing.episodes);
      setLoadingEpisodes(false);
      return;
    }

    // Fetch if missing
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
  };

  const toggleLike = () => {
    if (isLiked) likedStorage.removeFromLiked(tv.id, 'tv');
    else likedStorage.addToLiked({ id: tv.id, name: tv.name, poster_path: tv.poster_path, media_type: 'tv', vote_average: tv.vote_average || 0, first_air_date: tv.first_air_date });
    setIsLiked(!isLiked);
  };

  const buildImage = (path: string | null, size: string) => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-movie.jpg';

  const formatYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';

  // Common Hero Content (Title/Meta)
  const HeroContent = () => (
    <>
      <h1 className={`${isMobile ? 'text-3xl text-center' : 'text-6xl md:text-7xl'} font-extrabold text-white font-chillax leading-tight mb-4 drop-shadow-2xl`}>
        {tv.name}
      </h1>
      
      <div className={`flex items-center gap-3 text-sm text-gray-300 font-medium mb-6 ${isMobile ? 'justify-center' : ''}`}>
        <span className="text-white">{formatYear(tv.first_air_date)}</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="bg-white/10 px-2 py-0.5 rounded text-white text-xs">TV-MA</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span>{tv.number_of_seasons} Seasons</span>
        <span className="w-1 h-1 bg-gray-600 rounded-full" />
        <span className="flex items-center gap-1 text-yellow-400 font-bold"><Star className="w-3 h-3 fill-current" /> {tv.vote_average.toFixed(1)}</span>
      </div>
    </>
  );

  // ========================
  // MOBILE LAYOUT
  // ========================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-20">
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        <div className="absolute inset-0 h-[60vh] w-full overflow-hidden">
          <Image src={buildImage(tv.poster_path, 'w500')} alt="bg" fill className="object-cover opacity-20 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/90 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 pt-24">
          {/* Poster */}
          <div className="relative w-[220px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6">
            <Image src={buildImage(tv.poster_path, 'w780')} alt={tv.name} fill className="object-cover" priority />
          </div>

          <HeroContent />

          {/* Actions */}
          <div className="flex items-center gap-4 mb-8 w-full justify-center">
            <Link href={`/watch/tv/${tv.id}?season=1&episode=1`} className="flex-1 max-w-[160px] h-12 bg-white text-black rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-transform">
              <Play className="w-5 h-5 fill-black" />
              <span>Start</span>
            </Link>
            <button onClick={toggleWatchlist} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-95 ${isInWatchlist ? 'bg-green-500 border-green-500 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
              <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
            </button>
            <button onClick={toggleLike} className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all active:scale-95 ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 border border-white/10 text-white active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Season Selector */}
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white font-chillax">Episodes</h3>
            <SeasonSelector seasons={seasons} currentSeason={selectedSeasonNumber} onSelect={handleSeasonChange} />
          </div>

          {/* Horizontal Episode List (With Download Overlay) */}
          <div className="w-full min-h-[200px]">
            {loadingEpisodes ? (
              <div className="flex gap-4 overflow-hidden">
                {[1,2].map(i => <div key={i} className="w-[280px] aspect-video bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <EpisodeRow episodes={currentEpisodes} onPlay={(ep) => window.location.href = `/watch/tv/${tv.id}?season=${selectedSeasonNumber}&episode=${ep.episode_number}`} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // ========================
  // DESKTOP LAYOUT
  // ========================
  return (
    <div className="relative min-h-screen bg-[#050505] text-white">
      {/* Hero */}
      <div className="absolute inset-0 h-[85vh] w-full">
        <Image src={buildImage(tv.backdrop_path, 'original')} alt="backdrop" fill className="object-cover opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      <div className="absolute top-24 left-8 z-20">
        <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Home
        </Link>
      </div>

      <div className="relative z-10 pt-[25vh] pl-8 md:pl-16 max-w-4xl">
        <HeroContent />
        
        <p className="text-lg text-gray-200 leading-relaxed mb-8 max-w-2xl drop-shadow-md">
          {tv.overview}
        </p>

        <div className="flex items-center gap-4 mb-12">
          <Link href={`/watch/tv/${tv.id}?season=1&episode=1`} className="h-14 px-8 bg-white text-black rounded-full flex items-center gap-2 font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            <Play className="w-6 h-6 fill-black" />
            Start Watching
          </Link>
          <button onClick={toggleWatchlist} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all hover:scale-105 ${isInWatchlist ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
            <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
          </button>
          <button onClick={toggleLike} className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all hover:scale-105 ${isLiked ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Desktop Season/Episode Section */}
        <div className="w-full pb-20">
          <div className="flex items-center gap-6 mb-6">
            <h3 className="text-2xl font-bold text-white font-chillax">Episodes</h3>
            <SeasonSelector seasons={seasons} currentSeason={selectedSeasonNumber} onSelect={handleSeasonChange} />
          </div>

          <div className="w-full">
            {loadingEpisodes ? (
              <div className="flex gap-4 overflow-hidden">
                {[1,2,3].map(i => <div key={i} className="w-[320px] aspect-video bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <EpisodeRow episodes={currentEpisodes} onPlay={(ep) => window.location.href = `/watch/tv/${tv.id}?season=${selectedSeasonNumber}&episode=${ep.episode_number}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
