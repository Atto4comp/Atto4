// components/players/MoviePlayer.tsx
'use client';

import VideoPlayer from '@/components/player/VideoPlayer';

interface MoviePlayerProps {
  mediaId: number | string;
  title: string;
  poster?: string | null;
  backdrop?: string | null;
  onClose?: () => void;
}

export default function MoviePlayer({
  mediaId,
  title,
  poster,
  backdrop,
  onClose,
}: MoviePlayerProps) {
  return (
    <VideoPlayer
      key={mediaId}
      mediaId={mediaId}
      mediaType="movie"
      title={title}
      poster={poster}
      backdrop={backdrop}
      onClose={onClose}
    />
  );
}
