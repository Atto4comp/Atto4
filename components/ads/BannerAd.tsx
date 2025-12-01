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
      (function(zpvdzg){
        var d = document,
            s = d.createElement('script'),
            l = d.scripts[d.scripts.length - 1];
        s.settings = zpvdzg || {};
        s.src = "//aggressivestruggle.com/bFX.Vxs_ddGqlh0jYcWVcN/keimc9uuzZ/UwlPkHP/T/YW3LM/TxcQ1xMbzMQOtKN/jLcpxoN/zrUJzGNgQw";
        s.async = true;
        s.referrerPolicy = 'no-referrer-when-downgrade';
        /* We append to our specific container instead of relying on d.scripts location */
        document.getElementById('ad-slot-hero-bottom').appendChild(s);
      })({})
    `;

    // Since the original script uses `l.parentNode.insertBefore`, which relies on the script tag's position,
    // we need to adapt it slightly for React/Next.js where DOM manipulation is tricky.
    // A safer way for external ad scripts in React is often just appending the source directly:
    
    const s = document.createElement('script');
    s.src = "//aggressivestruggle.com/bFX.Vxs_ddGqlh0jYcWVcN/keimc9uuzZ/UwlPkHP/T/YW3LM/TxcQ1xMbzMQOtKN/jLcpxoN/zrUJzGNgQw";
    s.async = true;
    s.referrerPolicy = 'no-referrer-when-downgrade';
    
    adContainerRef.current.appendChild(s);

    return () => {
      // Cleanup if component unmounts (optional, depends on ad behavior)
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      id="ad-slot-hero-bottom"
      ref={adContainerRef} 
      className="w-full flex justify-center items-center my-8 min-h-[90px]"
    />
  );
}
