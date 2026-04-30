'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Layers, RefreshCw, House, ChevronDown, Check } from 'lucide-react';
import { getMovieEmbed } from '@/lib/api/video-movie';
import { getTVEmbed } from '@/lib/api/video-tv';
import { useProgressTracking } from '@/hooks/useProgressTracking';

interface VideoPlayerProps {
mediaId: number | string;
mediaType: 'movie' | 'tv';
season?: number;
episode?: number;
title?: string;
poster?: string | null;
backdrop?: string | null;
onClose?: () => void;

// 🎛️ DYNAMIC CONTROLS (Defaults)
showBackButton?: boolean;
showTitle?: boolean;
showHomeButton?: boolean;
}

const unlock = (str: string) => {
try {
return window.atob(str).split('').reverse().join('');
} catch (e) {
return '';
}
};

// ⚙️ CONFIG: Define which sources should force the title to be HIDDEN or SHOWN
// You can match by label (case-insensitive)
const SOURCE_CONFIG = {
hideTitle: ['vidsrc', 'vidme'],
showTitle: ['vidzy']
};

export default function VideoPlayer({
mediaId,
mediaType,
season = 1,
episode = 1,
title,
poster,
backdrop,
onClose,
showBackButton = true,
showTitle = false,
showHomeButton = true
}: VideoPlayerProps) {

const router = useRouter();

useProgressTracking({ mediaId, mediaType, title: title || 'Unknown Title', season, episode, poster, backdrop });

const [currentSourceIndex, setCurrentSourceIndex] = useState<number>(0);
const [sources, setSources] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [showServers, setShowServers] = useState(false);
const [isAutoSwitching, setIsAutoSwitching] = useState(false);
const [blobUrl, setBlobUrl] = useState<string | null>(null);

// 🛡️ Anti-DevTools Trap
useEffect(() => {
const check = setInterval(() => {
const t0 = Date.now();
// debugger; // Commented out for development convenience, uncomment for prod
const t1 = Date.now();
if (t1 - t0 > 100) {
setBlobUrl(null);
setSources([]);
setLoading(true);
window.location.replace('about:blank');
}
}, 1000);
return () => clearInterval(check);
}, []);

useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = 'unset'; }; }, []);

// Load Sources
useEffect(() => {
setLoading(true); setError(null); setCurrentSourceIndex(0);
const loadSources = async () => {
try {
let result = mediaType === 'movie' ? await getMovieEmbed(mediaId) : await getTVEmbed(mediaId, season, episode);
if (result.allSources?.length > 0) setSources(result.allSources);
else { setError('No sources available.'); setLoading(false); }
} catch (err) { setError('Failed to load video sources.'); setLoading(false); }
};
loadSources();
}, [mediaId, mediaType, season, episode]);

// Create Secure Frame
useEffect(() => {
const source = sources[currentSourceIndex];
if (!source) return;
const createSecureFrame = async () => {
setLoading(true); setBlobUrl(null);
try {
let realUrl = source.isEncrypted ? `${unlock(source.encryptedKey)}${source.mediaId}${source.suffix || ''}` : source.url;
const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body,html,iframe{width:100%;height:100%;margin:0;padding:0;background:#000;border:none;overflow:hidden;}</style></head><body><iframe src="${realUrl}" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></body></html>`;
const blob = new Blob([html], { type: 'text/html' });
setBlobUrl(URL.createObjectURL(blob));
setLoading(false); setIsAutoSwitching(false);
} catch (err) { handleSourceError(); }
};
createSecureFrame();
return () => { if (blobUrl) URL.revokeObjectURL(blobUrl); };
}, [currentSourceIndex, sources]);

const handleClose = () => { if (onClose) onClose(); else window.location.href = 'https://atto4.pro/'; };
const handleHome = () => { router.push('/'); };
const handleSourceError = useCallback(() => {
if (sources.length <= 1) return;
setIsAutoSwitching(true);
setTimeout(() => setCurrentSourceIndex((prev) => (prev + 1) % sources.length), 1500);
}, [sources.length]);

// 🧠 SMART TITLE LOGIC
const currentSource = sources[currentSourceIndex];
const currentLabel = currentSource?.label?.toLowerCase() || '';

const dynamicShowTitle = useMemo(() => {
// 1. If source matches 'hideTitle' list -> Force HIDE
if (SOURCE_CONFIG.hideTitle.some(name => currentLabel.includes(name))) return false;

// 2. If source matches 'showTitle' list -> Force SHOW
if (SOURCE_CONFIG.showTitle.some(name => currentLabel.includes(name))) return true;

// 3. Otherwise, fallback to the prop passed to the component
return showTitle;
}, [currentLabel, showTitle]);

if (loading && !isAutoSwitching) return <div className="fixed inset-0 bg-black z-[200] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent" /></div>;

if (error) return (
<div className="fixed inset-0 bg-black z-[200] flex items-center justify-center">
<div className="text-center text-white bg-white/10 p-8 rounded-xl backdrop-blur-md border border-white/10">
<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
<p className="text-lg font-medium mb-6">{error}</p>
<div className="flex gap-4 justify-center">
<button onClick={handleClose} className="bg-white text-black px-6 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors">Close</button>
{showHomeButton && <button onClick={handleHome} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors">Go Home</button>}
</div>
</div>
</div>
);

return (
<div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center group overflow-hidden">
    {/* 🟢 TOP BAR OVERLAY */}
    <div className="absolute top-0 left-0 right-0 z-[205] px-4 py-3 flex justify-between items-center bg-gradient-to-b from-black/80 via-black/30 to-transparent transition-opacity opacity-0 group-hover:opacity-100 duration-300 pointer-events-none group-hover:pointer-events-auto">

      {/* LEFT: Back Button & optional Title */}
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={handleClose}
            className="group/btn flex items-center justify-center w-9 h-9 rounded-full bg-white/8 hover:bg-white/16 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-200 shadow-lg"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
          </button>
        )}
        {dynamicShowTitle && (
          <span className="text-white/80 text-sm font-medium drop-shadow-sm max-w-[180px] md:max-w-sm truncate tracking-wide">
            {title || 'Back'}{mediaType === 'tv' && ` · S${season} E${episode}`}
          </span>
        )}
      </div>

      {/* RIGHT: Action Buttons */}
      <div className="relative flex items-center gap-2 pointer-events-auto">

        {/* Auto Fix */}
        <button
          onClick={handleSourceError}
          disabled={isAutoSwitching}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/8 hover:bg-white/16 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-200 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Auto Fix"
          title="Auto Fix"
        >
          <RefreshCw className={`w-4 h-4 ${isAutoSwitching ? 'animate-spin text-blue-400' : ''}`} />
        </button>

        {/* Home */}
        {showHomeButton && (
          <button
            onClick={handleHome}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/8 hover:bg-white/16 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-200 shadow-lg"
            aria-label="Home"
            title="Home"
          >
            <House className="w-4 h-4" />
          </button>
        )}

        {/* Server Picker */}
        <div className="relative">
          <button
            onClick={() => setShowServers(!showServers)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/8 hover:bg-white/16 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all duration-200 shadow-lg text-xs font-medium tracking-wide"
            aria-label="Select Server"
          >
            <Layers className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="max-w-[72px] truncate">{currentSource?.label || 'Server'}</span>
            <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-200 ${showServers ? 'rotate-180' : ''}`} />
          </button>

          {showServers && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[210]">
              <div className="px-2 py-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
                {sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentSourceIndex(idx); setShowServers(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs rounded-xl transition-all duration-150 ${
                      currentSourceIndex === idx
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/50 hover:bg-white/8 hover:text-white/90'
                    }`}
                  >
                    <span className="truncate">{src.label}</span>
                    {currentSourceIndex === idx && <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

{isAutoSwitching && <div className="absolute inset-0 z-[202] flex items-center justify-center bg-black/90 backdrop-blur-sm"><div className="flex flex-col items-center gap-4 text-white animate-pulse"><RefreshCw className="w-10 h-10 animate-spin text-blue-500" /><p className="font-medium text-lg">Trying next server...</p></div></div>}
{blobUrl && <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-0 bg-black overflow-hidden" allowFullScreen onError={handleSourceError} />}
</div>
);
}
