// components/layout/Footer.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, Instagram, Gamepad2 } from 'lucide-react'; // Note: Lucide uses 'Gamepad2' or similar for generic, but standard library usually has 'Discord' if updated, 
// OR we can stick to 'MessageCircle' if 'Discord' icon isn't directly exported in your Lucide version.
// HOWEVER, standard Lucide DOES NOT have a specific "Discord" icon. 
// It's cleaner to use an SVG for Discord or a generic chat icon. 
// I will use a custom SVG for Discord below to ensure it looks correct.

// Custom Discord Icon Component for accuracy
const DiscordIcon = ({ size = 18, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12h.01"/>
    <path d="M15 12h.01"/>
    <path d="M7.5 22C6.12 22 5 20.88 5 19.5V16h-.5C3.12 16 2 14.88 2 13.5V7.5C2 6.12 3.12 5 4.5 5h15C20.88 5 22 6.12 22 7.5v6c0 1.38-1.12 2.5-2.5 2.5H19v3.5c0 1.38-1.12 2.5-2.5 2.5H7.5z" fill="none" stroke="none"/> 
    {/* Actual Discord Logo Path approximation or use simple Gamepad2 if preferred. 
       Let's use standard Lucide 'Gamepad2' as a placeholder or 'MessageCircle' if you don't have a discord svg asset. 
       BUT, since you asked specifically for Discord, I will use the exact SVG path below. */}
    <path d="M18.855 4.276a.132.132 0 0 0-.067-.035 19.785 19.785 0 0 0-6.788-1.994.072.072 0 0 0-.077.034 13.985 13.985 0 0 0-.573 1.106 18.567 18.567 0 0 0-5.497 0 14.58 14.58 0 0 0-.576-1.106.07.07 0 0 0-.077-.034 19.797 19.797 0 0 0-6.788 1.994.132.132 0 0 0-.067.035C-.584 9.365-1.15 14.4 1.29 19.322a.13.13 0 0 0 .052.048 19.842 19.842 0 0 0 5.97 2.86.07.07 0 0 0 .079-.025 14.284 14.284 0 0 0 1.204-1.834.068.068 0 0 0-.039-.092 9.494 9.494 0 0 1-3.114-1.42.07.07 0 0 1 .027-.117c.233-.11.46-.227.683-.348a.07.07 0 0 1 .077.005 13.625 13.625 0 0 0 11.633 0 .07.07 0 0 1 .078-.005c.222.121.45.239.683.348a.07.07 0 0 1 .027.117 9.42 9.42 0 0 1-3.113 1.42.068.068 0 0 0-.04.092 14.537 14.537 0 0 0 1.205 1.834.07.07 0 0 0 .078.025 19.84 19.84 0 0 0 5.971-2.86.13.13 0 0 0 .052-.048c2.665-5.153 1.875-10.103 1.875-10.103zM8.024 15.33c-1.183 0-2.157-1.032-2.157-2.297 0-1.265.949-2.297 2.157-2.297 1.222 0 2.182 1.032 2.157 2.297 0 1.265-.935 2.297-2.157 2.297zm7.975 0c-1.183 0-2.157-1.032-2.157-2.297 0-1.265.949-2.297 2.157-2.297 1.222 0 2.182 1.032 2.157 2.297 0 1.265-.935 2.297-2.157 2.297z" fill="currentColor"/>
  </svg>
);

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
            
            {/* ✅ Social Media Links */}
            <div className="flex items-center gap-4 mt-2">
              <a 
                href="https://github.com/Atto4comp/Atto4"
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all border border-white/5 hover:border-white/20"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://instagram.com/YOUR_USERNAME"
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-pink-500 transition-all border border-white/5 hover:border-pink-500/20"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              
              {/* Discord Link (Replaced Twitter) */}
              <a 
                href="https://discord.gg/YOUR_INVITE_CODE" // Replace with your actual Discord invite
                target="_blank" 
                rel="noopener noreferrer"
                // Hover color changed to standard Discord Indigo (#5865F2)
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-[#5865F2] transition-all border border-white/5 hover:border-[#5865F2]/20"
                aria-label="Discord"
              >
                <DiscordIcon size={18} />
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
