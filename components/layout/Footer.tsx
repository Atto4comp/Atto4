'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Github, Instagram } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.04] mb-16 md:mb-0">
      {/* Mobile: Compact footer */}
      <div className="section-shell py-4 md:hidden">
        <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-white/16">
          <p>&copy; {currentYear} Atto4</p>
          <p>Content indexed from third-party providers</p>
        </div>
      </div>

      {/* Desktop: Full footer */}
      <div className="section-shell py-8 hidden md:block">
        {/* Main row */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Logo + Tagline */}
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.03]">
              <Image src="/logo.png" alt="Atto4" fill className="object-contain p-1" />
            </div>
            <span className="font-display text-sm font-semibold tracking-tight text-white/72">Atto4</span>
          </Link>

          {/* Socials */}
          <div className="flex items-center gap-1.5">
            <a
              href="https://github.com/Atto4comp/Atto4"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-white/24 transition-colors hover:text-white/48"
              aria-label="GitHub"
            >
              <Github className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://instagram.com/_.atto/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-white/24 transition-colors hover:text-white/48"
              aria-label="Instagram"
            >
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a
              href="https://discord.gg/YOUR_INVITE_CODE"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-white/24 transition-colors hover:text-white/48"
              aria-label="Discord"
            >
              <div className="relative h-3.5 w-3.5">
                <Image src="/discord.svg" alt="Discord" fill className="object-contain opacity-60" />
              </div>
            </a>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-5 flex flex-col gap-2 border-t border-white/[0.04] pt-4 text-[10px] uppercase tracking-[0.16em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {currentYear} Atto4</p>
          <p>Atto4 does not host media files. Content is indexed from third-party providers.</p>
        </div>
      </div>
    </footer>
  );
}
