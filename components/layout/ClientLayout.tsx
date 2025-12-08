// components/layout/ClientLayout.tsx
'use client';

import { useDevToolsProtection } from '@/hooks/useDevToolsProtection';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Activate the "Anti-Debug" protection
  useDevToolsProtection(); 

  return <>{children}</>;
}
