// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const scriptsLoaded = useRef(false);

  useEffect(() => {
    if (scriptsLoaded.current) return;

    // --- 1. Banner Ad Logic (320x50) ---
    if (adContainerRef.current) {
      adContainerRef.current.innerHTML = '';
      (window as any).atOptions = {
        key: '28f3f29a3ad710ba8ebc6c0299a7ac43',
        format: 'iframe',
        height: 50,
        width: 320,
        params: {},
      };
      const bannerScript = document.createElement('script');
      bannerScript.type = 'text/javascript';
      bannerScript.src = '//www.highperformanceformat.com/28f3f29a3ad710ba8ebc6c0299a7ac43/invoke.js';
      bannerScript.async = true;
      adContainerRef.current.appendChild(bannerScript);
    }

    // --- 2. Social Bar Script ---
    const socialScript = document.createElement('script');
    socialScript.type = 'text/javascript';
    socialScript.src = '//pigeoncontentmentcotton.com/40/2c/5a/402c5ae54cc050c5e5c9b22337c9ce34.js';
    socialScript.async = true;
    document.body.appendChild(socialScript);

    // --- 3. Smart Link (Popunder Behavior) ---
    // Opens the direct link on the first click anywhere on the page
    const smartLinkUrl = "https://pigeoncontentmentcotton.com/znrqf72e?key=d863fb2769018f657e1467c2caecadad";
    
    const handleSmartLinkClick = () => {
      // Check session storage to avoid spamming every click
      if (!sessionStorage.getItem('smartLinkOpened')) {
        window.open(smartLinkUrl, '_blank');
        sessionStorage.setItem('smartLinkOpened', 'true');
      }
    };

    // Attach click listener to the window
    window.addEventListener('click', handleSmartLinkClick);

    scriptsLoaded.current = true;

    // Cleanup
    return () => {
      window.removeEventListener('click', handleSmartLinkClick);
    };
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
    </div>
  );
}
