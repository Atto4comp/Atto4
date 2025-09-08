module.exports = {

"[project]/lib/api/video-api.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// lib/api/video-api.ts
__turbopack_context__.s({
    "buildEmbedUrl": ()=>buildEmbedUrl,
    "getEmbedUrlCandidates": ()=>getEmbedUrlCandidates,
    "resolveTmdbId": ()=>resolveTmdbId,
    "videoApi": ()=>videoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
/** Read and normalize environment variables */ const ENV = {
    BASE: (("TURBOPACK compile-time value", "https://vidsrc.to/embed/movie/") || "").trim(),
    E1: (process.env.NEXT_PUBLIC_VIDEO_EMBED_1 || "https://cinemaos.tech/player/${id}?autoplay=true").trim(),
    E2: (process.env.NEXT_PUBLIC_VIDEO_EMBED_2 || "https://cinemaos.tech/player/${id}/${season}/${episode}?autoplay=true&autonext=true").trim(),
    E3: (process.env.NEXT_PUBLIC_VIDEO_EMBED_3 || "").trim(),
    E4: (process.env.NEXT_PUBLIC_VIDEO_EMBED_4 || "").trim()
};
/** Global extra params appended to every embed URL */ const EXTRA_PARAMS = (process.env.NEXT_PUBLIC_VIDEO_URL_PARAMS || "").trim();
/** Providers list with friendly names (fallback order) */ const VIDEO_PROVIDERS = [
    {
        name: "Primary",
        value: ENV.E1,
        priority: 1
    },
    {
        name: "Secondary",
        value: ENV.E2,
        priority: 2
    },
    {
        name: "Tertiary",
        value: ENV.E3,
        priority: 3
    },
    {
        name: "Backup",
        value: ENV.E4,
        priority: 4
    },
    {
        name: "Base",
        value: ENV.BASE,
        priority: 5
    }
].filter((p)=>!!p.value);
/** Extract hostname for friendly server label */ function getServerLabel(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch  {
        return 'Unknown Server';
    }
}
/** Build the default embed path for base URLs */ function buildEmbedPath(mediaType, tmdbId, season, episode) {
    if (mediaType === "movie") return `/movie/${tmdbId}`;
    if (season && episode) return `/tv/${tmdbId}/${season}/${episode}`;
    return `/tv/${tmdbId}`;
}
/** Check if provider uses template placeholders */ function isTemplate(url) {
    return /\$\{(id|type|season|episode)\}/.test(url);
}
/** Normalize base URL (remove trailing slash) */ function normalizeBase(url) {
    return url.endsWith("/") ? url.slice(0, -1) : url;
}
/** Append query parameters safely */ function appendParams(url, params) {
    if (!params) return url;
    return url + (url.includes("?") ? "&" : "?") + params;
}
/** Build raw URL from template or base provider */ function buildRawUrl(providerValue, mediaType, tmdbId, season, episode) {
    if (isTemplate(providerValue)) {
        // Template mode: replace placeholders
        return providerValue.replace(/\$\{id\}/g, String(tmdbId)).replace(/\$\{type\}/g, mediaType).replace(/\$\{season\}/g, season ? String(season) : "1").replace(/\$\{episode\}/g, episode ? String(episode) : "1");
    }
    // Base mode: append canonical path
    const base = normalizeBase(providerValue);
    return `${base}${buildEmbedPath(mediaType, tmdbId, season, episode)}`;
}
function buildEmbedUrl(providerValue, mediaType, tmdbId, season, episode) {
    const raw = buildRawUrl(providerValue, mediaType, tmdbId, season, episode);
    return appendParams(raw, EXTRA_PARAMS);
}
function getEmbedUrlCandidates(mediaType, tmdbId, season, episode) {
    const urls = VIDEO_PROVIDERS.map((provider)=>buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode));
    // Remove duplicates while preserving order
    return [
        ...new Set(urls)
    ];
}
/** Create VideoSource from provider */ function createVideoSource(provider, mediaType, tmdbId, season, episode) {
    const url = buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode);
    return {
        url,
        quality: "HD",
        type: "iframe",
        servers: `${provider.name} (${getServerLabel(url)})`,
        tmdbId,
        mediaType
    };
}
async function resolveTmdbId(input, type) {
    if (typeof input === "number" && Number.isFinite(input)) return input;
    const str = String(input).trim();
    const asNum = Number(str);
    if (Number.isFinite(asNum)) return asNum;
    // Handle IMDb IDs
    if (/^tt\d+$/i.test(str)) {
        const API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")?.trim();
        if (!API_KEY) return null;
        try {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/find/${str}`, {
                params: {
                    api_key: API_KEY,
                    external_source: "imdb_id"
                },
                timeout: 5000
            });
            const results = type === "movie" ? data.movie_results : data.tv_results;
            return results?.[0]?.id ?? null;
        } catch (error) {
            console.error('Failed to resolve IMDb ID:', error);
            return null;
        }
    }
    return null;
}
const videoApi = {
    /** Check if any video APIs are configured */ hasConfiguredApis () {
        return VIDEO_PROVIDERS.length > 0;
    },
    /** Get configuration status for debugging */ getConfigStatus () {
        return {
            configured: VIDEO_PROVIDERS.length,
            providers: VIDEO_PROVIDERS.map((p)=>({
                    name: p.name,
                    configured: !!p.value,
                    isTemplate: isTemplate(p.value),
                    priority: p.priority
                })),
            extraParams: EXTRA_PARAMS || 'none'
        };
    },
    /** Get all embed URL candidates for media */ getEmbedUrlCandidates,
    /** Get movie video sources */ async getMovieSources (tmdbId) {
        return VIDEO_PROVIDERS.map((provider)=>createVideoSource(provider, "movie", tmdbId));
    },
    /** Get TV show video sources */ async getTVSources (tmdbId, season, episode) {
        return VIDEO_PROVIDERS.map((provider)=>createVideoSource(provider, "tv", tmdbId, season, episode));
    },
    /** Get movie with embed data */ async getMovieWithEmbed (tmdbId) {
        const API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")?.trim();
        try {
            const [movieResponse, sources] = await Promise.all([
                API_KEY ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 10000
                }) : Promise.resolve({
                    data: null
                }),
                this.getMovieSources(tmdbId)
            ]);
            return {
                movie: movieResponse.data,
                embedUrl: sources[0]?.url || "",
                sources
            };
        } catch (error) {
            console.error('Error fetching movie with embed:', error);
            return {
                movie: null,
                embedUrl: "",
                sources: []
            };
        }
    },
    /** Get TV show with embed data */ async getTVShowWithEmbed (tmdbId, season, episode) {
        const API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")?.trim();
        try {
            const [tvResponse, sources] = await Promise.all([
                API_KEY ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 10000
                }) : Promise.resolve({
                    data: null
                }),
                this.getTVSources(tmdbId, season, episode)
            ]);
            return {
                tvShow: tvResponse.data,
                embedUrl: sources[0]?.url || "",
                sources
            };
        } catch (error) {
            console.error('Error fetching TV show with embed:', error);
            return {
                tvShow: null,
                embedUrl: "",
                sources: []
            };
        }
    },
    /** Debug helper to log all configured providers */ logConfiguration () {
        console.log('Video API Configuration:', this.getConfigStatus());
    }
};
}),
"[project]/components/player/VideoPlayer.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>VideoPlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-api.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function VideoPlayer({ mediaId, mediaType, season, episode, onClose }) {
    const [embedUrl, setEmbedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [sources, setSources] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentSourceIndex, setCurrentSourceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isTesting, setIsTesting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const iframeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const testTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Test a source with timeout
    const testSource = (url, timeout = 8000)=>{
        return new Promise((resolve)=>{
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.style.position = 'absolute';
            iframe.style.top = '-9999px';
            iframe.src = url;
            let resolved = false;
            const timer = setTimeout(()=>{
                if (!resolved) {
                    resolved = true;
                    iframe.remove();
                    resolve(false);
                }
            }, timeout);
            iframe.onload = ()=>{
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    iframe.remove();
                    resolve(true);
                }
            };
            iframe.onerror = ()=>{
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timer);
                    iframe.remove();
                    resolve(false);
                }
            };
            document.body.appendChild(iframe);
        });
    };
    // Find first working source
    const findWorkingSource = async (videoSources)=>{
        setIsTesting(true);
        for(let i = 0; i < videoSources.length; i++){
            console.log(`Testing source ${i + 1}/${videoSources.length}: ${videoSources[i].servers}`);
            const isWorking = await testSource(videoSources[i].url);
            if (isWorking) {
                console.log(`✓ Source ${i + 1} working: ${videoSources[i].servers}`);
                setIsTesting(false);
                return i;
            } else {
                console.log(`✗ Source ${i + 1} failed: ${videoSources[i].servers}`);
            }
        }
        setIsTesting(false);
        return null;
    };
    // Load and test sources
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        const loadSources = async ()=>{
            setLoading(true);
            setError(null);
            setEmbedUrl('');
            try {
                // Load sources from API
                const videoSources = mediaType === 'movie' ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["videoApi"].getMovieSources(mediaId) : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["videoApi"].getTVSources(mediaId, season || 1, episode || 1);
                if (cancelled) return;
                if (videoSources.length === 0) {
                    setError('No video sources available');
                    setLoading(false);
                    return;
                }
                setSources(videoSources);
                // Try server-side check first (if available)
                try {
                    const response = await fetch('/api/check-embed', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            mediaType,
                            tmdbId: mediaId,
                            season: season || 1,
                            episode: episode || 1
                        })
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.workingUrl) {
                            const workingIndex = videoSources.findIndex((s)=>s.url === data.workingUrl);
                            if (workingIndex !== -1) {
                                setCurrentSourceIndex(workingIndex);
                                setEmbedUrl(data.workingUrl);
                                setLoading(false);
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.log('Server-side check failed, using client-side fallback');
                }
                // Client-side fallback
                const workingIndex = await findWorkingSource(videoSources);
                if (cancelled) return;
                if (workingIndex !== null) {
                    setCurrentSourceIndex(workingIndex);
                    setEmbedUrl(videoSources[workingIndex].url);
                } else {
                    setError('All video sources failed to load');
                }
            } catch (err) {
                console.error('Failed to load video sources:', err);
                if (!cancelled) {
                    setError('Failed to load video sources');
                }
            } finally{
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };
        loadSources();
        return ()=>{
            cancelled = true;
            if (testTimeoutRef.current) {
                clearTimeout(testTimeoutRef.current);
            }
        };
    }, [
        mediaId,
        mediaType,
        season,
        episode
    ]);
    // Handle iframe error - try next source
    const handleIframeError = async ()=>{
        console.warn(`Iframe error on source: ${sources[currentSourceIndex]?.servers}`);
        const remainingSources = sources.slice(currentSourceIndex + 1);
        if (remainingSources.length === 0) {
            setError('All video sources failed to load');
            return;
        }
        // Test remaining sources
        for(let i = 0; i < remainingSources.length; i++){
            const absoluteIndex = currentSourceIndex + 1 + i;
            const isWorking = await testSource(remainingSources[i].url, 5000);
            if (isWorking) {
                console.log(`Switching to source ${absoluteIndex + 1}: ${sources[absoluteIndex].servers}`);
                setCurrentSourceIndex(absoluteIndex);
                setEmbedUrl(sources[absoluteIndex].url);
                setError(null);
                return;
            }
        }
        setError('All video sources failed to load');
    };
    // Handle successful load
    const handleIframeLoad = ()=>{
        console.log(`✓ Successfully loaded: ${sources[currentSourceIndex]?.servers}`);
        setError(null);
    };
    // Handle close
    const handleClose = ()=>{
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };
    // Handle ESC key
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleKeyDown = (e)=>{
            if (e.key === 'Escape') {
                handleClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return ()=>document.removeEventListener('keydown', handleKeyDown);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: [
            (loading || isTesting) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-white text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-6 mx-auto"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 245,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl mb-2",
                            children: isTesting ? 'Testing video sources...' : 'Loading video sources...'
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 246,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400",
                            children: "Finding the best server for you"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 249,
                            columnNumber: 13
                        }, this),
                        sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-gray-500 mt-2",
                            children: [
                                sources.length,
                                " sources available"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 253,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/player/VideoPlayer.tsx",
                    lineNumber: 244,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/player/VideoPlayer.tsx",
                lineNumber: 243,
                columnNumber: 9
            }, this),
            error && !loading && !isTesting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-white text-center max-w-md px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-6xl mb-6",
                            children: "⚠️"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 265,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-4",
                            children: "Unable to Play Video"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 266,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300 mb-4",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 267,
                            columnNumber: 13
                        }, this),
                        sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400 mb-6",
                            children: [
                                "Tested ",
                                sources.length,
                                " different servers"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 269,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors",
                            children: "Go Back"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 274,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/player/VideoPlayer.tsx",
                    lineNumber: 264,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/player/VideoPlayer.tsx",
                lineNumber: 263,
                columnNumber: 9
            }, this),
            embedUrl && !loading && !error && !isTesting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                        ref: iframeRef,
                        src: embedUrl,
                        className: "w-full h-full",
                        allowFullScreen: true,
                        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                        onError: handleIframeError,
                        onLoad: handleIframeLoad,
                        style: {
                            border: 'none'
                        }
                    }, void 0, false, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 287,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 right-4 text-white/70 text-sm pointer-events-none",
                        children: "Auto-switch enabled — Press ESC to exit"
                    }, void 0, false, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 299,
                        columnNumber: 11
                    }, this),
                    ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono",
                                children: [
                                    "Server: ",
                                    sources[currentSourceIndex]?.servers
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 306,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-gray-300 mt-1",
                                children: [
                                    "Source ",
                                    currentSourceIndex + 1,
                                    " of ",
                                    sources.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 309,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 305,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/components/player/VideoPlayer.tsx",
        lineNumber: 240,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/watch/[mediatype]/[id]/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// app/watch/[mediatype]/[id]/page.tsx
__turbopack_context__.s({
    "default": ()=>WatchPage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$player$2f$VideoPlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/player/VideoPlayer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/tmdb.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function WatchPage() {
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [mediaData, setMediaData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const mediaType = params?.mediatype;
    const id = parseInt(params?.id);
    // Get season and episode from query params for TV shows
    const season = parseInt(searchParams.get('season') || '1');
    const episode = parseInt(searchParams.get('episode') || '1');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Hide body scroll for fullscreen experience
        document.body.style.overflow = 'hidden';
        return ()=>{
            document.body.style.overflow = 'auto';
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadMediaData() {
            try {
                let data;
                if (mediaType === 'movie') {
                    data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieDetails(id);
                } else {
                    data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tmdbApi"].getTVShowDetails(id);
                }
                setMediaData(data);
            } catch (error) {
                console.error('Failed to load media:', error);
            } finally{
                setLoading(false);
            }
        }
        if (id && mediaType) {
            loadMediaData();
        }
    }, [
        id,
        mediaType
    ]);
    const handleClose = ()=>{
        router.back();
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading..."
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 63,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                lineNumber: 61,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 60,
            columnNumber: 7
        }, this);
    }
    if (!mediaData) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 bg-black flex items-center justify-center text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-xl font-semibold mb-4",
                        children: "Media not found"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClose,
                        className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors",
                        children: "Go Back"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 74,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 71,
            columnNumber: 7
        }, this);
    }
    const title = mediaData.title || mediaData.name;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$player$2f$VideoPlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        mediaId: id,
        mediaType: mediaType,
        title: title,
        season: mediaType === 'tv' ? season : undefined,
        episode: mediaType === 'tv' ? episode : undefined,
        onClose: handleClose
    }, void 0, false, {
        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
}),

};

//# sourceMappingURL=_8a8ff613._.js.map