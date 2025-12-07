// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BannerAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const [isAdBlocked, setIsAdBlocked] = useState(false);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // 1. Clear previous content
    adContainerRef.current.innerHTML = '';

    // 2. Define the ad configuration
    (window as any).atOptions = {
      key: '28f3f29a3ad710ba8ebc6c0299a7ac43',
      format: 'iframe',
      height: 50,
      width: 320,
      params: {},
    };

    // 3. Create the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.highperformanceformat.com/28f3f29a3ad710ba8ebc6c0299a7ac43/invoke.js';
    script.async = true;

    // 4. Detect Ad Blockers (Error Handling)
    script.onerror = () => {
      console.log("Ad script blocked by extension");
      setIsAdBlocked(true);
    };

    adContainerRef.current.appendChild(script);

    // 5. Secondary Check: If height remains 0 after 2 seconds, assume blocked
    const checkInterval = setInterval(() => {
        if (adContainerRef.current && adContainerRef.current.clientHeight < 10) {
            setIsAdBlocked(true);
        }
    }, 2000);

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
      clearInterval(checkInterval);
    };
  }, []);

  // If Ad is blocked, show this Fallback (Static Affiliate/Donation)
  if (isAdBlocked) {
    return (
        <div className="w-full flex flex-col items-center justify-center my-8 px-4 bg-transparent gap-2">
            <div className="text-[10px] uppercase tracking-widest text-gray-600 font-medium opacity-50">
                Supported by
            </div>
            <Link 
                href="/donate" // Link to your donation page or an affiliate offer (e.g., 1Win, VPN)
                className="relative w-full max-w-[320px] h-[50px] flex items-center justify-center bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:border-white/30 transition-all group"
            >
                {/* You can replace this text with a static image banner from public folder */}
                <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                   ❤️ Support Atto4 - Donate Here
                </span>
            </Link>
        </div>
    );
  }

  // Standard Ad View
  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4 bg-transparent gap-6">
      <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-medium opacity-50">
        Sponsored
      </div>

      <div className="relative w-full max-w-[320px] min-h-[50px] flex items-center justify-center bg-black border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div
          ref={adContainerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
}
