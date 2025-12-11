// components/player/PhantomShield.tsx
'use client';

import { useEffect } from 'react';

export default function PhantomShield() {
  useEffect(() => {
    // 1. Disable Right Click Context Menu (Global)
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
        window.location.replace('https://google.com'); // Punishment
      }
    };

    // 3. DevTools Detection Loop (The "Nuclear" Option)
    const devToolsTrap = setInterval(() => {
      // Method A: Dimension Check (If docked devtools opens)
      // Note: Threshold needs to be large enough to not trigger on resize
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if ((widthThreshold || heightThreshold) && (window as any).Firebug) {
         window.location.replace('about:blank');
      }
      
      // Method B: Debugger Pause Check
      const t0 = Date.now();
      // eslint-disable-next-line no-debugger
      debugger; 
      const t1 = Date.now();
      
      if (t1 - t0 > 100) {
        window.location.replace('https://google.com'); 
      }
    }, 500); // Check every 500ms

    // Attach listeners to window (captures everything)
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      clearInterval(devToolsTrap);
    };
  }, []);

  // We return null because the protection is logic-based, not a physical div blocking clicks.
  // A physical div would break video playback interactions (Play/Pause/Volume).
  return null; 
}
