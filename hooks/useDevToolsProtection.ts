// hooks/useDevToolsProtection.ts
'use client';

import { useEffect } from 'react';

export function useDevToolsProtection() {
  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, etc.)
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

    // 3. The "Debugger Trap" (Aggressive)
    // If DevTools is open, this freezes the page so they can't click elements.
    const freezeDevTools = () => {
      const start = Date.now();
      debugger; // This halts execution if DevTools is open!
      
      // Optional: Detect if they bypassed the debugger
      // If 'debugger' took more than 100ms, DevTools is likely open
      if (Date.now() - start > 100) {
        // They are inspecting. We can redirect or clear the DOM.
        document.body.innerHTML = '<div style="background:black;color:white;height:100vh;display:flex;align-items:center;justify-content:center;"><h1>Access Denied</h1></div>';
        // or: window.location.href = "about:blank";
      }
    };

    // Run the trap every second. 
    // It has zero impact on normal users (debugger statement does nothing if DevTools is closed).
    const interval = setInterval(() => {
      freezeDevTools();
    }, 1000);

    // Attach listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
