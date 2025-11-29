'use client'; // ✅ FIX: This creates a Client Component boundary

import { useState, useEffect } from 'react';

export default function LoadingSpinner() {
  const [progress, setProgress] = useState(0);

  // Simulate a "pixel fill" loading effect
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 5));
    }, 100); // Fast updates for retro feel

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full">
      
      {/* Pixel Progress Container */}
      <div className="relative w-64 h-2 bg-white/5 border border-white/10 overflow-hidden">
        
        {/* Pixel Blocks Animation */}
        <div 
          className="h-full bg-white transition-all duration-100 ease-steps"
          style={{ width: `${progress}%` }}
        />
        
        {/* Glitch/Scanline Overlay (Optional Polish) */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      </div>

      {/* Text Animation */}
      <div className="mt-4 text-xs font-bold text-white/80 font-mono tracking-[0.2em] uppercase animate-pulse">
        Loading...
      </div>

      {/* Custom CSS for "Stepped" pixel movement */}
      <style jsx>{`
        .ease-steps {
          transition-timing-function: steps(10, end);
        }
      `}</style>
    </div>
  );
}

