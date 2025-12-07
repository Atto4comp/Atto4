// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, ArrowRight } from 'lucide-react'; // Import icons

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

    // 4. Detect Ad Blockers (Error Handling)
    script.onerror = () => {
      console.log("Ad script blocked by extension");
      setIsAdBlocked(true);
    };

    adContainerRef.current.appendChild(script);

    // 5. Secondary Check: If height remains 0 after 2 seconds, assume blocked
    const checkInterval = setInterval(() => {
        // If the container is empty or super small, it's likely blocked/hidden
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

  // --- PREMIUM FALLBACK BANNER (SHOWN WHEN AD BLOCKED) ---
  if (isAdBlocked) {
    return (
        <div className="w-full flex flex-col items-center justify-center my-8 px-4 bg-transparent gap-3 animate-in fade-in duration-700">
            
            {/* Label */}
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-gray-500 font-medium opacity-70">
                <Sparkles size={10} className="text-yellow-500" />
                <span>Support Us</span>
                <Sparkles size={10} className="text-yellow-500" />
            </div>

            <Link 
                href="/donate"
                className="group relative w-full max-w-[320px] h-[60px] flex items-center justify-between px-5 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all duration-300 shadow-lg hover:shadow-red-900/10"
            >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                
                {/* Left Side: Icon & Text */}
                <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 rounded-full bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <Heart className="w-5 h-5 text-red-500 fill-current animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-red-100 transition-colors">
                            Donate to Atto4
                        </span>
                        <span className="text-[10px] text-gray-400 group-hover:text-gray-300">
                            Keep the website running 🚀
                        </span>
                    </div>
                </div>

                {/* Right Side: Arrow */}
                <div className="relative z-10 bg-white/5 p-1.5 rounded-lg group-hover:bg-white/10 transition-all group-hover:translate-x-1">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
                </div>
            </Link>
        </div>
    );
  }

  // --- STANDARD AD VIEW ---
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
