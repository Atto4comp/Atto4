// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const socialBarRef = useRef<boolean>(false);

  // 1. Existing Banner Ad Logic
  useEffect(() => {
    if (!adContainerRef.current) return;

    // Clear previous banner content
    adContainerRef.current.innerHTML = '';

    // Set global options for the Banner
    (window as any).atOptions = {
      key: '28f3f29a3ad710ba8ebc6c0299a7ac43',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {},
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    // NOTE: I kept your original banner link. Ensure this URL is correct for your banner ad key '28f3...43'
    // If you meant to replace the banner source with the social bar source, let me know.
    // Assuming this is the "Banner" part:
    script.src = '//pigeoncontentmentcotton.com/28f3f29a3ad710ba8ebc6c0299a7ac43/invoke.js'; 
    script.async = true;

    adContainerRef.current.appendChild(script);

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  // 2. New Social Bar Script Logic
  useEffect(() => {
    // Prevent duplicate injection
    if (socialBarRef.current) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//pigeoncontentmentcotton.com/40/2c/5a/402c5ae54cc050c5e5c9b22337c9ce34.js';
    script.async = true;

    // Social Bars usually attach to body. We append it to body to ensure it works.
    // If you want to try and force it into a specific div, you can append to a ref,
    // but these scripts often break if not in body/head.
    document.body.appendChild(script);
    
    socialBarRef.current = true;
    
    // No cleanup for global script to prevent errors on unmount/remount cycles
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4 bg-transparent gap-6">
      
      {/* Label */}
      <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-medium opacity-50">
        Sponsored
      </div>

      {/* Main Banner Frame */}
      <div className="relative w-full max-w-[320px] min-h-[50px] flex items-center justify-center bg-black border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div
          ref={adContainerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
        />
      </div>

      {/* 
         Note: The Social Bar script (pigeoncontentmentcotton) typically renders a floating element 
         fixed to the screen edges, so it won't appear "inside" a div here. 
         It is now injected and will appear as an overlay on the site.
      */}

    </div>
  );
}
