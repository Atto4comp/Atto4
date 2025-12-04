// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent double-loading: check if the container already has the script
    if (bannerRef.current && !bannerRef.current.firstChild) {
      
      // 1. Create the configuration script (atOptions)
      const conf = document.createElement('script');
      conf.type = 'text/javascript';
      conf.innerHTML = `
        atOptions = {
          'key' : '28f3f29a3ad710ba8ebc6c0299a7ac43',
          'format' : 'iframe',
          'height' : 50,
          'width' : 320,
          'params' : {}
        };
      `;

      // 2. Create the executable script (invoke.js)
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/28f3f29a3ad710ba8ebc6c0299a7ac43/invoke.js`;

      // 3. Append them to the container in order
      bannerRef.current.append(conf);
      bannerRef.current.append(script);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 px-4">
      {/* Label */}
      <div className="text-[10px] uppercase tracking-widest text-gray-500/50 mb-2 font-medium">
        Sponsored
      </div>

      {/* Frame: Adjusted to fit 320x50 perfectly */}
      <div className="relative flex items-center justify-center bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md shadow-lg transition-all hover:border-white/20">
        
        {/* Ad Container */}
        {/* We set explicit dimensions here to prevent Layout Shift (CLS) */}
        <div 
          ref={bannerRef} 
          className="flex items-center justify-center overflow-hidden"
          style={{ width: '320px', height: '50px' }}
        >
          {/* Scripts will be injected here */}
        </div>

      </div>
    </div>
  );
}
