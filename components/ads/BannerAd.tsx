// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight } from 'lucide-react'; 

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
    script.src = '//pigeoncontentmentcotton.com/28f3f29a3ad710ba8ebc6c0299a7ac43/invoke.js'; 
    script.async = true;

    // 4. Detect Hard Blocks (Script Load Error)
    script.onerror = () => {
      console.log("Ad script blocked (onerror)");
      setIsAdBlocked(true);
    };

    adContainerRef.current.appendChild(script);

    // 5. SMARTER CHECK: Wait 12 seconds before deciding it's blocked/empty
    const checkTimeout = setTimeout(() => {
        if (!adContainerRef.current) return;
        const hasIframe = adContainerRef.current.querySelector('iframe');
        const hasHeight = adContainerRef.current.clientHeight > 10;

        if (!hasIframe && !hasHeight) {
            console.log("Ad timed out (12s) - switching to backup");
            setIsAdBlocked(true);
        }
    }, 12000); 

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
      clearTimeout(checkTimeout);
    };
  }, []);

  // --- PREMIUM FALLBACK BANNER (BLENDED DESIGN) ---
  if (isAdBlocked) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-6 px-4 animate-in fade-in duration-700">
            
            <Link 
                href="/donate"
                className="group relative flex items-center gap-4 py-3 px-6 rounded-full transition-all duration-300 hover:bg-white/5"
            >
                {/* Subtle Glow behind the heart */}
                <div className="absolute left-6 w-8 h-8 bg-red-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Left Side: Icon */}
                <Heart className="w-5 h-5 text-red-500 fill-red-500/20 animate-pulse" />
                
                {/* Center: Text */}
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
                        Enjoying Atto4? <span className="text-red-400">Support us</span>
                    </span>
                </div>

                {/* Right Side: Arrow (Appears on Hover) */}
                <ArrowRight className="w-4 h-4 text-white/50 -ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:ml-0 transition-all duration-300" />
            </Link>
        </div>
    );
  }

  // --- STANDARD AD VIEW ---
  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4 bg-transparent gap-4">
      <div className="text-[10px] uppercase tracking-widest text-white/20 font-medium">
        Sponsored
      </div>

      <div className="relative w-full max-w-[320px] min-h-[50px] flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
        <div
          ref={adContainerRef}
          className="w-full h-full flex items-center justify-center overflow-hidden"
        />
      </div>
    </div>
  );
}
