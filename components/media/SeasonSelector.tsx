'use client';

import { useState, useRef, useEffect } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeSeason = seasons.find(s => s.season_number === currentSeason) || seasons[0];

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-95"
      >
        <span className="font-chillax font-semibold text-sm sm:text-base">
          {activeSeason?.name || `Season ${currentSeason}`}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`absolute top-full left-0 mt-2 w-56 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-200 origin-top-left ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-h-64 overflow-y-auto scrollbar-hide py-1">
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => {
                onSelect(season.season_number);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors flex justify-between items-center ${
                season.season_number === currentSeason
                  ? 'bg-white/10 text-white font-semibold'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{season.name}</span>
              <span className="text-xs opacity-50">{season.episode_count} Eps</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
