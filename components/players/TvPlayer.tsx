// components/players/TvPlayer.tsx
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
    // Update URL silently without reload
    window.history.replaceState(
      null,
      '',
      `/watch/tv/${mediaId}?season=${s}&episode=${e}`,
    );
  };

  const nextEpisode = () => handleEpisodeChange(currentSeason, currentEpisode + 1);
  const prevEpisode = () => {
    if (currentEpisode > 1) handleEpisodeChange(currentSeason, currentEpisode - 1);
  };

  return (
    <div className="relative w-full h-full">
      <VideoPlayer
        // KEY IS IMPORTANT: Forces full reset when episode changes
        key={`${mediaId}-s${currentSeason}-e${currentEpisode}`}
        mediaId={mediaId}
        mediaType="tv"
        season={currentSeason}
        episode={currentEpisode}
        title={title} // no S/E here
        poster={poster}
        backdrop={backdrop}
        onClose={onClose}
      />

      {/* TV Navigation Overlay */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-black/50 backdrop-blur-lg px-6 py-3 rounded-full border border-white/10 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={prevEpisode}
          disabled={currentEpisode <= 1}
          className="text-white hover:text-blue-400 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <span className="text-sm font-bold text-white min-w-[80px] text-center">
          S{currentSeason} : E{currentEpisode}
        </span>

        <button
          onClick={nextEpisode}
          className="text-white hover:text-blue-400 transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
