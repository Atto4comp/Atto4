'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

interface SeasonSelectorProps {
  seasons: Season[];
  currentSeason: number;
  onSelect: (seasonNumber: number) => void;
}

export default function SeasonSelector({ seasons, currentSeason, onSelect }: SeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent | KeyboardEventInit) {
      if ((e as KeyboardEvent).key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKey as any);
    return () => window.removeEventListener('keydown', handleKey as any);
  }, [isOpen]);

  const activeSeason = seasons.find(s => s.season_number === currentSeason) || seasons[0];

  const handleKeyNav = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // support arrow navigation inside dropdown when open
    if (!isOpen) return;
    const focusable = Array.from(dropdownRef.current?.querySelectorAll<HTMLButtonElement>('button[data-season]') || []);
    if (!focusable.length) return;

    const idx = focusable.findIndex((el) => el === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = focusable[(idx + 1) % focusable.length];
      next?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = focusable[(idx - 1 + focusable.length) % focusable.length];
      prev?.focus();
    } else if (e.key === 'Home') {
      focusable[0]?.focus();
    } else if (e.key === 'End') {
      focusable[focusable.length - 1]?.focus();
    }
  };

  return (
    <div className="relative z-30 inline-block text-left" ref={dropdownRef} onKeyDown={handleKeyNav}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-95 min-w-[140px] justify-between"
        type="button"
      >
        <span className="font-chillax font-semibold text-sm sm:text-base truncate">
          {activeSeason?.name || `Season ${currentSeason}`}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-activedescendant={`season-${activeSeason?.season_number}`}
          className="absolute top-full left-0 mt-2 w-64 bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
        >
          <div className="max-h-64 overflow-y-auto py-1">
            {seasons.map((season) => (
              <button
                key={season.id}
                data-season={season.season_number}
                id={`season-${season.season_number}`}
                onClick={() => {
                  onSelect(season.season_number);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors flex justify-between items-center border-b border-white/5 last:border-0 ${
                  season.season_number === currentSeason
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                type="button"
              >
                <span className="truncate mr-2">{season.name}</span>
                <span className="text-xs opacity-50 whitespace-nowrap">{season.episode_count} Eps</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
