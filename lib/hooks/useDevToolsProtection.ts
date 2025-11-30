// hooks/useDevToolsProtection.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useDevToolsProtection() {
  const router = useRouter();

  useEffect(() => {
    // 1. Disable Right Click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Detect DevTools & Redirect
    // This interval checks if the devtools are stealing focus or affecting performance
    // The 'debugger' trap is the most common way to detect this state.
    const detectDevTools = setInterval(() => {
      const start = performance.now();
      // This 'debugger' statement will PAUSE execution if DevTools is open
      debugger; 
      const end = performance.now();

      // If execution paused for more than 100ms, DevTools is likely open
      if (end - start > 100) {
        alert('Developer Tools are not allowed.'); // Optional warning
        router.replace('/'); // 🚀 Force Redirect to Home
        window.location.href = '/'; // Fallback hard redirect
      }
    }, 1000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(detectDevTools);
    };
  }, [router]);
}
