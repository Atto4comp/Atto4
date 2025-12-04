// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clear any previous content before injecting a new ad
    adContainerRef.current.innerHTML = '';

    // Set the global atOptions config
    (window as any).atOptions = {
      key: '28f3f29a3ad710ba8ebc6c0299a7ac43',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {},
    };

    // Create the invoke.js script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.highperformanceformat.com/28f3f29a3ad710ba8ebc6c0299a7ac43/invoke.js';
    script.async = true;

    // Append into our banner container
    adContainerRef.current.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4">
      {/* Label - Darker text for subtle look */}
      <div className="text-[10px] uppercase tracking-widest text-gray-700 mb-2 font-medium">
        Sponsored
      </div>

      {/* Ad Container Frame - Black Background */}
      <div className="relative w-full max-w-[320px] min-h-[50px] flex items-center justify-center bg-black border border-white/5 rounded-xl overflow-hidden shadow-lg transition-all hover:border-white/10">
        <div
          ref={adContainerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
}
