// hooks/useDevToolsProtection.ts
'use client';

import { useEffect } from 'react';

export function useDevToolsProtection() {
  useEffect(() => {
    // TEMPORARILY DISABLED - Was blocking Firebase Firestore async operations
    // The debugger trap interferes with async Firebase calls

    // TODO: Re-enable after Firebase is working, but make it less aggressive
    // or add exception for Firebase domains

    console.log('[DevTools Protection] Temporarily disabled for Firebase compatibility');

    // No protection active
    return () => {
      // Cleanup (none needed now)
    };
  }, []);
}
