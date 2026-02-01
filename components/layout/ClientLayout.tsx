// components/layout/ClientLayout.tsx
'use client';

import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';
import { AuthProvider } from '@/lib/context/AuthContext';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Activate the "Anti-Debug" protection
  useDevToolsProtection();

  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
