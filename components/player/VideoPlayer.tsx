'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, Server, RefreshCw, Home } from 'lucide-react';
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
hideTitle: ['vidly', 'vidme'],
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
<div className="absolute top-0 left-0 right-0 z-[205] p-4 flex justify-between items-center bg-gradient-to-b from-black/90 via-black/50 to-transparent transition-opacity opacity-0 group-hover:opacity-100 duration-300 pointer-events-none group-hover:pointer-events-auto">

{/* 🎛️ LEFT SECTION: Back Button & Title */}
<div className="flex items-center gap-4">
<button onClick={handleClose} className="flex items-center gap-3 text-white/80 hover:text-white transition-colors group/btn text-left">

{/* 1. Back Arrow */}
{showBackButton && (
<div className="p-2 rounded-full bg-white/10 group-hover/btn:bg-white/20 backdrop-blur-md transition-colors flex-shrink-0">
<ArrowLeft className="w-5 h-5" />
</div>
)}

{/* 2. DYNAMIC TITLE (Based on logic above) */}
{dynamicShowTitle && (
<span className="font-medium text-sm md:text-base drop-shadow-md max-w-[200px] md:max-w-md truncate">
{title || 'Back'}
{/* Optional: Add Episode info if needed */}
{mediaType === 'tv' && ` - S${season} E${episode}`}
</span>
)}
</button>
</div>

{/* 🎛️ RIGHT SECTION: Home, Servers, AutoFix */}
<div className="relative flex gap-3 pointer-events-auto">

<button onClick={handleSourceError} disabled={isAutoSwitching} className="flex items-center gap-2 bg-red-500/20 text-red-200 hover:bg-red-500/30 backdrop-blur-md px-4 py-2 rounded-full text-xs md:text-sm font-medium border border-red-500/20 transition-all disabled:opacity-50">
<RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${isAutoSwitching ? 'animate-spin' : ''}`} />
<span className="hidden md:inline">{isAutoSwitching ? 'Switching...' : 'Auto Fix'}</span>
</button>

{/* 3. Home Button */}
{showHomeButton && (
<button onClick={handleHome} className="flex items-center gap-2 bg-blue-600/20 text-blue-200 hover:bg-blue-600/30 backdrop-blur-md px-4 py-2 rounded-full text-xs md:text-sm font-medium border border-blue-500/20 transition-all">
<Home className="w-3 h-3 md:w-4 md:h-4" />
<span className="hidden md:inline">Home</span>
</button>
)}

<div className="relative">
<button onClick={() => setShowServers(!showServers)} className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs md:text-sm font-medium hover:bg-white/20 border border-white/10 transition-all text-white">
<Server className="w-3 h-3 md:w-4 md:h-4" />
<span>{currentSource?.label || 'Server'}</span>
</button>
{showServers && (
<div className="absolute right-0 top-full mt-2 w-56 bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[210]">
<div className="p-2 max-h-[60vh] overflow-y-auto scrollbar-hide">
{sources.map((src, idx) => (
<button key={idx} onClick={() => { setCurrentSourceIndex(idx); setShowServers(false); }} className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all ${currentSourceIndex === idx ? 'bg-white text-black font-bold shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}>
<div className="flex items-center justify-between"><span>{src.label}</span>{currentSourceIndex === idx && <div className="w-2 h-2 rounded-full bg-green-500" />}</div>
</button>
))}
</div>
</div>
)}
</div>
</div>
</div>

{isAutoSwitching && <div className="absolute inset-0 z-[202] flex items-center justify-center bg-black/90 backdrop-blur-sm"><div className="flex flex-col items-center gap-4 text-white animate-pulse"><RefreshCw className="w-10 h-10 animate-spin text-blue-500" /><p className="font-medium text-lg">Trying next server...</p></div></div>}
{blobUrl && <iframe key={blobUrl} src={blobUrl} className="w-full h-full border-0 bg-black overflow-hidden" allowFullScreen sandbox="allow-forms allow-scripts allow-same-origin allow-presentation" onError={handleSourceError} />}
</div>
);
}
