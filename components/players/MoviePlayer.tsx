// components/players/MoviePlayer.tsx
'use client';

import VideoPlayer from '@/components/player/VideoPlayer';

interface MoviePlayerProps {
  mediaId: number | string;
  title: string;
  onClose?: () => void;
}

export default function MoviePlayer({ mediaId, title, onClose }: MoviePlayerProps) {
  return (
    <VideoPlayer
      mediaId={mediaId}
      mediaType="movie"
      title={title}
      onClose={onClose}
    />
  );
}
