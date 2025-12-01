// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adContainerRef.current) return;

    // Check if script already exists to prevent duplicates on re-renders
    if (adContainerRef.current.querySelector('script[src*="aggressivestruggle.com"]')) {
      return;
    }
   const script = document.createElement('script');
    // The provided script logic wrapped safely
    const code = `
(function(wdzliw){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = wdzliw || {};
s.src = "\/\/aggressivestruggle.com\/b\/XPVysPd.Gxlj0BY\/W-cv\/meump9yuIZKUDlUkzPOT\/YZ3JMCTacU2AMvT\/QmtINojecsxMNAzzYtxxN\/Qh";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})

    `;
    // Create the script element
    const s = document.createElement('script');
    // Use the specific source URL provided in your snippet logic
    s.src = "//aggressivestruggle.com/bFX.Vxs_ddGqlh0jYcWVcN/keimc9uuzZ/UwlPkHP/T/YW3LM/TxcQ1xMbzMQOtKN/jLcpxoN/zrUJzGNgQw";
    s.async = true;
    s.referrerPolicy = 'no-referrer-when-downgrade';
    
    // Append to our container
    adContainerRef.current.appendChild(s);

    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-8 px-4">
      {/* Label */}
      <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-medium">
        Advertisement
      </div>

      {/* Ad Container Frame */}
      <div className="relative w-full max-w-[728px] min-h-[90px] flex items-center justify-center bg-white/5 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm shadow-lg transition-all hover:border-white/20">
        
        {/* The Ad Script Injection Slot */}
        <div 
          id="ad-slot-hero-bottom"
          ref={adContainerRef} 
          className="w-full h-full flex items-center justify-center overflow-hidden"
        />
        
      </div>
    </div>
  );
}
