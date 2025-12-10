'use client';

import { useState } from 'react';
import VideoPlayer from '@/components/player/VideoPlayer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TvPlayerProps {
  mediaId: number | string;
  season: number;
  episode: number;
  title: string;
  poster?: string | null;
  backdrop?: string | null;
  onClose?: () => void;
}

export default function TvPlayer({
  mediaId,
  season,
  episode,
  title,
  poster,
  backdrop,
  onClose,
}: TvPlayerProps) {
  const [currentSeason, setCurrentSeason] = useState(season);
  const [currentEpisode, setCurrentEpisode] = useState(episode);

  const handleEpisodeChange = (s: number, e: number) => {
    setCurrentSeason(s);
    setCurrentEpisode(e);
    // Update URL silently
    window.history.replaceState(null, '', `/watch/tv/${mediaId}?season=${s}&episode=${e}`);
  };

  const nextEpisode = () => handleEpisodeChange(currentSeason, currentEpisode + 1);
  const prevEpisode = () => {
    if (currentEpisode > 1) handleEpisodeChange(currentSeason, currentEpisode - 1);
  };

  return (
    <div className="relative w-full h-full">
      <VideoPlayer
        // Force reset on episode change
        key={`${mediaId}-s${currentSeason}-e${currentEpisode}`}
        mediaId={mediaId}
        mediaType="tv"
        season={currentSeason}
        episode={currentEpisode}
        title={title}
        poster={poster}
        backdrop={backdrop}
        onClose={onClose}
      />

      {/* TV Navigation Overlay - FIXED Z-INDEX [120] to sit ABOVE the player (z-100) */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-4 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 hover:bg-black/80 transition-all duration-300 group">
        <button
          onClick={prevEpisode}
          disabled={currentEpisode <= 1}
          className="text-white hover:text-blue-400 disabled:opacity-30 transition-colors p-1"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-sm font-bold text-white min-w-[90px] text-center select-none font-mono">
          S{currentSeason} : E{currentEpisode}
        </span>

        <button
          onClick={nextEpisode}
          className="text-white hover:text-blue-400 transition-colors p-1"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
