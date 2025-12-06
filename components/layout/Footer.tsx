// components/layout/Footer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, Instagram, Twitter } from 'lucide-react'; // Imported icons

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black border-t border-white/5 pt-16 pb-8 relative overflow-hidden">
      
      {/* Ambient Glow (Subtle) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-900/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1800px] mx-auto px-6 sm:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          
          {/* Branding Section */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 transition-transform duration-300 group-hover:scale-110">
                <Image
                  src="/logo.png"
                  alt="Atto4 Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-chillax font-bold text-2xl text-white tracking-tight group-hover:text-blue-400 transition-colors">
                  Atto4
                </span>
              </div>
            </Link>
            <p className="text-gray-500 text-sm max-w-xs text-center md:text-left">
              Your premium destination for streaming movies and TV shows. 
              Discover, watch, and enjoy in HD.
            </p>
            
            {/* ✅ Social Media Links Added Here */}
            <div className="flex items-center gap-4 mt-2">
              <a 
                href="https://github.com/Atto4comp/Atto4" // Replace with your actual link
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/20"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://instagram.com/YOUR_USERNAME" // Replace with your actual link
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-pink-500 transition-all border border-white/5 hover:border-pink-500/20"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://twitter.com/YOUR_USERNAME" // Replace with your actual link
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-blue-400 transition-all border border-white/5 hover:border-blue-400/20"
                aria-label="Twitter / X"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Disclaimer Section (Minimal) */}
          <div className="max-w-lg text-center md:text-right space-y-2">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider opacity-80">
              Legal Disclaimer
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed">
              Atto4 does not host any files on its servers. All content is provided by non-affiliated third parties. 
              We do not accept responsibility for content hosted on third-party websites and do not involve ourselves in downloading or uploading videos.
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <p>
            &copy; {currentYear} Atto4. All rights reserved.
          </p>
          
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <span className="text-red-500 animate-pulse">♥</span>
            <span>for entertainment</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
