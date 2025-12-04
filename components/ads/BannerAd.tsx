// components/ads/BannerAd.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function BannerAd() {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    // Prevent double-loading the script if the component re-renders
    if (scriptLoaded.current) return;

    try {
      // Create the script element
      const script = document.createElement('script');
      
      // Set the attributes from your snippet
      script.dataset.zone = '10275770';
      script.src = 'https://gizokraijaw.net/vignette.min.js';
      
      // Append to the document body (standard for vignette scripts)
      document.body.appendChild(script);
      
      // Mark as loaded
      scriptLoaded.current = true;
      
      console.log('Vignette ad script loaded');
    } catch (err) {
      console.error('Error loading vignette script:', err);
    }
  }, []);

  // Since this is a Vignette (Popup), it has no visual component on the page.
  // We return null so we don't show an empty "Sponsored" box.
  return null;
}
