'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface Props {
  src: string;
  headers?: Record<string, string>;
  poster?: string;
  title?: string;
}

export default function HLSPlayer({
  src,
  headers,
  poster,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        xhrSetup: (xhr) => {
          if (headers) {
            for (const [k, v] of Object.entries(headers)) {
              xhr.setRequestHeader(k, v);
            }
          }
        },
      });

      hls.loadSource(src);
      hls.attachMedia(videoRef.current);

      return () => hls.destroy();
    }

    // Safari native HLS
    videoRef.current.src = src;
  }, [src, headers]);

  return (
    <video
      ref={videoRef}
      controls
      poster={poster}
      className="w-full h-full bg-black"
    />
  );
}
