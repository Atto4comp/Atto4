// components/HLSPlayer.tsx
import Hls from "hls.js";
import { useEffect, useRef } from "react";

export default function HLSPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current || !src) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        // Minimal config needed now
        xhrSetup: (xhr, url) => {
          // Only add headers if it's NOT our proxy (optional safety)
          // But since we use Blob rewrites, the URLs are already proxied.
        }
      });
      
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      
      hls.on(Hls.Events.ERROR, (event, data) => {
         if (data.fatal) console.error("HLS Fatal Error", data);
      });

      return () => hls.destroy();
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // Native support (Safari/iOS) works perfectly with the Blob URL!
      videoRef.current.src = src;
    }
  }, [src]);

  return <video ref={videoRef} controls className="w-full h-full" />;
}
