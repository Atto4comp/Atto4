// hooks/useDevToolsProtection.ts
'use client';

import { useEffect } from 'react';

export function useDevToolsProtection() {
  useEffect(() => {
    // 1. Disable Right Click (On your UI)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (On your UI)
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

    // 3. AGGRESSIVE TRAP: Detect DevTools even if Iframe is focused
    const threshold = 160; // ms
    
    const aggressiveTrap = () => {
      const start = performance.now();
      
      // The 'debugger' statement pauses execution if DevTools is open
      debugger; 
      
      const end = performance.now();
      
      // If the debugger paused us, 'end - start' will be huge (>100ms)
      if (end - start > threshold) {
        // DevTools is definitely open. PUNISH THEM.
        
        // Option A: Clear the entire page
        document.body.innerHTML = '<div style="background:black;color:red;height:100vh;display:flex;align-items:center;justify-content:center;font-family:sans-serif;text-align:center;"><h1>⚠️ Developer Tools Detected</h1><p>Please close Inspector to continue watching.</p></div>';
        
        // Option B: Redirect (Uncomment to use)
        // window.location.href = "about:blank";
      }
    };

    // Run this check frequently
    const interval = setInterval(aggressiveTrap, 1000);

    // Add listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
