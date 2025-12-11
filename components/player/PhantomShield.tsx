'use client';

import { useEffect } from 'react';

export default function PhantomShield() {
  useEffect(() => {
    // 1. 🚫 DISABLE RIGHT CLICK (Context Menu)
    // We use { capture: true } to intercept the event before it reaches the iframe or anything else.
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // 2. ⌨️ DISABLE SHORTCUTS (The Hacker Keys)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        nukeSession(e);
      }
      
      // Ctrl+Shift+I (Inspect), Ctrl+Shift+C (Element Picker), Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) {
        nukeSession(e);
      }
      
      // Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        nukeSession(e);
      }
    };

    // 3. ☢️ THE PUNISHMENT FUNCTION
    const nukeSession = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      // Immediate redirection to wipe state
      window.location.replace('https://google.com'); 
    };

    // 4. 🕵️‍♀️ DEVTOOLS TRAP (The Loop)
    // Detects if the window size changes strangely (docking devtools) 
    // or if the JS execution time drags (debugger open).
    const devToolsTrap = setInterval(() => {
      // Check A: Debugger Pause
      const t0 = Date.now();
      // eslint-disable-next-line no-debugger
      debugger; 
      const t1 = Date.now();
      
      if (t1 - t0 > 100) {
        window.location.replace('about:blank'); 
      }

      // Check B: Window Resize Threshold (Aggressive)
      // Only works if DevTools is docked. 
      // We skip this on mobile to prevent false positives on rotation.
      if (window.innerWidth > 768) {
        const threshold = 160;
        if (
          window.outerWidth - window.innerWidth > threshold || 
          window.outerHeight - window.innerHeight > threshold
        ) {
           // Suspicious resize behavior often indicates DevTools opening
           // We won't ban them immediately (could be resizing window), 
           // but we can force a reload or clear state.
        }
      }
    }, 1000);

    // ATTACH LISTENERS WITH { capture: true }
    // This is the secret. It catches the event at the Window level 
    // BEFORE it dives down into the iframe.
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      clearInterval(devToolsTrap);
    };
  }, []);

  // We return NULL. We do not render a div.
  // Rendering a div over the iframe would block the "Play" button.
  // The security is now entirely in the event listeners above.
  return null;
}
