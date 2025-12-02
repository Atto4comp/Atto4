// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const adRef = useRef<HTMLModElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // 1. Load the Google AdSense script globally if not already loaded
    if (!window.adsbygoogle && !scriptLoaded.current) {
      const script = document.createElement('script');
      ;
    }

    // 2. Push the ad only once after component mounts
    try {
      // We check if the ad has already been populated to prevent "adsbygoogle.push() error: All ins elements in the DOM with class=adsbygoogle already have ads in them."
      if (adRef.current && !adRef.current.innerHTML) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4">
      {/* Label */}
      <div className="text-[10px] uppercase tracking-widest text-gray-500/50 mb-2 font-medium">
        Sponsored
      </div>

      {/* Frame */}
      <div className="relative w-full max-w-[728px] min-h-[90px] bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-lg transition-all hover:border-white/20">
        
        {/* Google AdSense Unit */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client="ca-pub-6668961984680825"
            data-ad-slot="5254377433"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>

      </div>
    </div>
  );
}

// Add type declaration for window.adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

