// components/player/PhantomShield.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PhantomShield() {
  const router = useRouter();

  useEffect(() => {
    // 1. Disable Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        e.stopPropagation();
        // Punishment: Redirect immediately
        window.location.href = 'about:blank';
      }
    };

    // 3. DevTools Detection Loop (The "Nuclear" Option)
    // This constantly checks if the window size changes suspiciously (opening devtools)
    // or if the debugger statement hits.
    const devToolsTrap = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if ((widthThreshold || heightThreshold) && (window as any).Firebug && (window as any).console && (window as any).console.debug) {
         // This is a common heuristic for open DevTools
         window.location.replace('about:blank');
      }
      
      const t0 = Date.now();
      // eslint-disable-next-line no-debugger
      debugger; 
      const t1 = Date.now();
      
      if (t1 - t0 > 100) {
        window.location.replace('https://google.com'); // Kick them out to Google
      }
    }, 1000);

    // Attach listeners
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsTrap);
    };
  }, [router]);

  return (
    // Z-INDEX 9000: Covers almost everything
    // pointer-events-auto: Captures all clicks that fall on it
    <div 
      className="fixed inset-0 z-[9000] w-screen h-screen bg-transparent"
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
