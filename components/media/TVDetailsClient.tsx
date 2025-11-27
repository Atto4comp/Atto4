'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Heart, Star, Share2, ChevronLeft, Download } from 'lucide-react';
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
  };

  const toggleLike = () => {
    if (isLiked) likedStorage.removeFromLiked(tv.id, 'tv');
    else likedStorage.addToLiked({ id: tv.id, name: tv.name, poster_path: tv.poster_path, media_type: 'tv', vote_average: tv.vote_average || 0, first_air_date: tv.first_air_date });
    setIsLiked(!isLiked);
  };

  const buildImage = (path: string | null, size: string) => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder-movie.jpg';

  const formatYear = (date?: string) => date ? new Date(date).getFullYear() : 'N/A';

  // ========================
  // MOBILE LAYOUT (Similar to Movie but with Episodes)
  // ========================
  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] pb-20">
        <div className="fixed top-4 left-4 z-50">
          <Link href="/" className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10">
            <ChevronLeft className="w-6 h-6" />
          </Link>
        </div>

        <div className="absolute inset-0 h-[60vh] w-full overflow-hidden">
          <Image src={buildImage(tv.poster_path, 'w500')} alt="bg" fill className="object-cover opacity-30 blur-2xl scale-110" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-[#0a0a0a]/90 to-[#0a0a0a]" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-6 pt-24">
          <div className="relative w-[200px] aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mb-6">
            <Image src={buildImage(tv.poster_path, 'w780')} alt={tv.name} fill className="object-cover" priority />
          </div>

          <h1 className="text-3xl font-bold text-white text-center font-chillax mb-2">{tv.name}</h1>
          
          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-6">
            <span>{formatYear(tv.first_air_date)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{tv.number_of_seasons} Seasons</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400"><Star className="w-3 h-3 fill-current" /> {tv.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-4 mb-8 w-full justify-center max-w-sm">
            <Link href={`/watch/tv/${tv.id}?season=1&episode=1`} className="flex-1 h-12 bg-white text-black rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg active:scale-95 transition-transform">
              <Play className="w-5 h-5 fill-black" />
              <span>Play</span>
            </Link>
            <button onClick={toggleWatchlist} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${isInWatchlist ? 'bg-green-500 border-green-500 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
              <Plus className={`w-6 h-6 ${isInWatchlist ? 'rotate-45' : ''}`} />
            </button>
            <button onClick={toggleLike} className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${isLiked ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/10 text-white'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white font-chillax">Episodes</h3>
            <SeasonSelector seasons={seasons} currentSeason={selectedSeasonNumber} onSelect={handleSeasonChange} />
          </div>

          <div className="w-full min-h-[200px] mb-8">
            {loadingEpisodes ? (
              <div className="flex gap-4 overflow-hidden">
                {[1,2].map(i => <div key={i} className="w-[280px] aspect-video bg-white/5 rounded-xl animate-pulse" />)}
              </div>
            ) : (
              <EpisodeRow episodes={currentEpisodes} onPlay={(ep) => window.location.href = `/watch/tv/${tv.id}?season=${selectedSeasonNumber}&episode=${ep.episode_number}`} />
            )}
          </div>

          <CastList cast={cast} />
        </div>
      </div>
    );
  }

  // ========================
  // DESKTOP LAYOUT (Redesigned)
  // ========================
  return (
    <div className="relative min-h-screen bg-[#050505] text-white -mt-[4rem]">
      {/* Ambient Background */}
      <div className="absolute inset-0 h-[100vh] w-full overflow-hidden">
        <Image 
          src={buildImage(tv.backdrop_path, 'original')} 
          alt="backdrop" 
          fill 
          className="object-cover opacity-40 blur-md scale-105" 
          priority 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/50 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-8 md:px-16 pt-[18vh] flex gap-12 items-start">
        
        {/* Vertical Card */}
        <div className="hidden md:block w-[350px] flex-shrink-0">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 group">
            <Image 
              src={buildImage(tv.poster_path, 'w780')} 
              alt={tv.name} 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105" 
              priority 
            />
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 pt-4">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-6 text-sm font-medium">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <h1 className="text-6xl lg:text-7xl font-extrabold font-chillax leading-[1.1] mb-4 drop-shadow-2xl tracking-tight">
            {tv.name}
          </h1>

          <div className="flex items-center gap-4 mb-8 text-sm text-gray-300 font-medium">
            <span className="text-white">{formatYear(tv.first_air_date)}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="bg-white/10 px-2 py-0.5 rounded text-xs">TV-MA</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span>{tv.number_of_seasons} Seasons</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1 text-yellow-400"><Star className="w-4 h-4 fill-current" /> {tv.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex items-center gap-4 mb-10">
            <Link href={`/watch/tv/${tv.id}?season=1&episode=1`} className="h-14 px-10 bg-white text-black rounded-xl flex items-center gap-3 font-bold text-lg hover:bg-gray-200 transition-all hover:scale-[1.02] shadow-lg">
              <Play className="w-6 h-6 fill-black" />
              Start Watching
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

          <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl font-light">
            {tv.overview}
          </p>

          <div className="mb-12">
            <CastList cast={cast} />
          </div>

          {/* Episodes Section - Full Width Desktop */}
          <div className="w-full pb-20">
            <div className="flex items-center gap-6 mb-6 border-b border-white/5 pb-4">
              <h3 className="text-2xl font-bold text-white font-chillax">Episodes</h3>
              <SeasonSelector seasons={seasons} currentSeason={selectedSeasonNumber} onSelect={handleSeasonChange} />
            </div>

            <div className="w-full">
              {loadingEpisodes ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-white/5 rounded-xl animate-pulse" />)}
                </div>
              ) : (
                // Pass a prop to EpisodeRow to indicate full grid mode if needed, or reuse horizontal scroll
                // For desktop space filling, we can let the row expand naturally
                <EpisodeRow episodes={currentEpisodes} onPlay={(ep) => window.location.href = `/watch/tv/${tv.id}?season=${selectedSeasonNumber}&episode=${ep.episode_number}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
