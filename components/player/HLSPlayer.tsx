'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HLSPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  onClose?: () => void;
}

export default function HLSPlayer({
  src,
  poster,
  title,
  onClose,
}: HLSPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // --- Init HLS ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error('HLS fatal error', data);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video.play();
        setIsBuffering(false);
      });
    }

    return () => {
      hls?.destroy();
    };
  }, [src]);

  // --- Controls ---
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolume = (v: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = v;
    setVolume(v);
    setIsMuted(v === 0);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-50 group"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => {
          setIsPlaying(true);
          setIsBuffering(false);
        }}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Buffer */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Loader2 className="w-14 h-14 text-white animate-spin" />
        </div>
      )}

      {/* Controls */}
      <div
        className={`absolute inset-0 flex flex-col justify-between transition-opacity ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top */}
        <div className="p-5 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-4">
          <button
            onClick={onClose || (() => router.back())}
            className="text-white hover:text-blue-400"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-medium truncate">{title}</h1>
        </div>

        {/* Bottom */}
        <div className="p-5 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={togglePlay} className="text-white">
                {isPlaying ? (
                  <Pause className="w-8 h-8 fill-white" />
                ) : (
                  <Play className="w-8 h-8 fill-white" />
                )}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white">
                  {isMuted ? (
                    <VolumeX className="w-6 h-6" />
                  ) : (
                    <Volume2 className="w-6 h-6" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolume(+e.target.value)}
                  className="w-24"
                />
              </div>
            </div>

            <button onClick={toggleFullscreen} className="text-white">
              {isFullscreen ? (
                <Minimize className="w-6 h-6" />
              ) : (
                <Maximize className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
