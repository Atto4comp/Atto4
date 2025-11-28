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
        className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 text-white px-4 py-2.5 rounded-xl hover:bg-white/20 transition-all active:scale-95 min-w-[140px] justify-between"
      >
        <span className="font-chillax font-semibold text-sm sm:text-base truncate">
          {activeSeason?.name || `Season ${currentSeason}`}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#151515]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-64 overflow-y-auto py-1 season-scrollbar">
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => {
                  onSelect(season.season_number);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm transition-colors flex justify-between items-center border-b border-white/5 last:border-0 ${
                  season.season_number === currentSeason
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="truncate mr-2">{season.name}</span>
                <span className="text-xs opacity-50 whitespace-nowrap">{season.episode_count} Eps</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      <style jsx>{`
        .season-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .season-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .season-scrollbar::-webkit-scrollbar-thumb {
          background: #444;
          border-radius: 10px;
        }
        .season-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #666;
        }
      `}</style>
    </div>
  );
}
