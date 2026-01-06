'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, Instagram, ShieldAlert } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    // ✅ Unified BG: #09090b & Minimal Layout
    <footer className="w-full bg-[#09090b] border-t border-white/5 pt-12 pb-6 relative overflow-hidden">
      
      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 opacity-90 transition-opacity group-hover:opacity-100">
                <Image
                  src="/logo.png"
                  alt="Atto4 Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-chillax font-bold text-xl text-white tracking-tight">
                Atto4
              </span>
            </Link>
            <p className="text-gray-500 text-xs max-w-xs text-center md:text-left">
              Discover, watch, and enjoy. No ads, just entertainment.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-2">
              <a 
                href="https://github.com/Atto4comp/Atto4"
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>

              <a 
                href="https://instagram.com/_.atto/"
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-pink-400 transition-colors rounded-full hover:bg-pink-500/10"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              
              <a 
                href="https://discord.gg/YOUR_INVITE_CODE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-[#5865F2] transition-colors rounded-full hover:bg-[#5865F2]/10"
                aria-label="Discord"
              >
                <div className="relative w-[18px] h-[18px]">
                  <Image 
                    src="/discord.svg"
                    alt="Discord"
                    fill
                    className="object-contain opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              </a>
            </div>
          </div>

          {/* Legal Disclaimer Section */}
          <div className="max-w-md text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-yellow-500" />
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Legal Disclaimer
              </h4>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Atto4 does not host any files itself but instead only displays content from 3rd party providers. 
              All content is provided by non-affiliated third parties. Legal issues should be taken up with them. 
              We do not accept responsibility for content hosted on third-party websites.
            </p>
          </div>
        </div>

        <div className="w-full h-px bg-white/5 mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-gray-600 font-medium uppercase tracking-wider">
          <p>
            &copy; {currentYear} Atto4. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <span className="text-red-500">♥</span>
            <span>for entertainment</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
