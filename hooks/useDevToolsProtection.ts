// hooks/useDevToolsProtection.ts
'use client';

import { useEffect } from 'react';

export function useDevToolsProtection() {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // 3. THE TRAP: Redirect on Detection
    const aggressiveTrap = () => {
      const start = performance.now();
      
      // The browser pauses here if DevTools is open
      debugger; 
      
      const end = performance.now();
      
      // If user was paused for more than 100ms, they are inspecting
      if (end - start > 100) {
        // 🚨 REDIRECT IMMEDIATELY
        window.location.href = "about:blank";
      }
    };

    // Check every 500ms
    const interval = setInterval(aggressiveTrap, 500);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
