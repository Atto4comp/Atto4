// components/layout/Footer.tsx
'use client';

import { Bold } from 'lucide-react';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full bg-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        
        {/* Mobile Layout */}
        <div className="flex flex-col space-y-4 sm:hidden">
          {/* Branding with Logo - Mobile */}
          <div className="flex items-center justify-center gap-3">
            <Image
              src="/logo.png"
              alt="Atto4 Logo"
              width={32}
              height={32}
              className="object-contain"
            />
            <div className="text-center">
              <p className="logo-name font-chillax">Atto4</p>
              <p className="text-gray-400 text-xs">Stream. Discover.</p>
            </div>
          </div>

          {/* Disclaimer - Mobile */}
          <div className="text-center px-2">
            <p className="text-gray-400 text-xs leading-relaxed">
              <span className="font-medium text-gray-300">Disclaimer:</span> Atto4 does not host any files. All content 
              is provided by third-party providers. We are not responsible for 
              content accuracy or legality from external sources.
            </p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center sm:justify-between gap-8">
          {/* Left: Branding with Logo - Desktop */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Atto4 Logo"
              width={40}
              height={40}
              className="object-contain"
            />
            <div>
             <p className="logo-name font-chillax">Atto4</p>
              <p className="text-gray-500 text-sm">Stream. Discover.</p>
            </div>
          </div>

          {/* Right: Disclaimer - Desktop */}
          <div className="flex-1 text-right max-w-4xl">
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="font-medium text-gray-300">Disclaimer:</span> Atto4 does not host any files on its servers. All content 
              is provided by third-party providers.
            </p>
            <p className="text-gray-400 text-sm leading-relaxed">
                 Atto4 is not responsible for the 
              accuracy, compliance, copyright, legality, or decency of content 
              provided by such third-party sites.
            </p>
          </div>
        </div>

        {/* Bottom Copyright - Both Mobile & Desktop */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs">
            Built with <span className="text-red-500">♥</span> for entertainment enthusiasts worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
