(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/api/video-api.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-api.ts
__turbopack_context__.s({
    "buildEmbedUrl": ()=>buildEmbedUrl,
    "getEmbedUrlCandidates": ()=>getEmbedUrlCandidates,
    "parseSeasonEpisodeFromUrl": ()=>parseSeasonEpisodeFromUrl,
    "resolveTmdbId": ()=>resolveTmdbId,
    "videoApi": ()=>videoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
function parseSeasonEpisodeFromUrl(url) {
    try {
        const parsed = new URL(url);
        const pathSegments = parsed.pathname.split('/').filter(Boolean);
        // Try path-based: /tv/{id}/{season}/{episode}
        if (pathSegments.length >= 4 && pathSegments[0] === 'tv') {
            const season = parseInt(pathSegments[2], 10);
            const episode = parseInt(pathSegments[3], 10);
            if (!isNaN(season) && !isNaN(episode) && season > 0 && episode > 0) {
                return {
                    season,
                    episode
                };
            }
        }
        // Try query params: ?s=1&e=2 or ?season=1&episode=2
        const seasonParam = parsed.searchParams.get('s') || parsed.searchParams.get('season');
        const episodeParam = parsed.searchParams.get('e') || parsed.searchParams.get('episode');
        if (seasonParam && episodeParam) {
            const season = parseInt(seasonParam, 10);
            const episode = parseInt(episodeParam, 10);
            if (!isNaN(season) && !isNaN(episode) && season > 0 && episode > 0) {
                return {
                    season,
                    episode
                };
            }
        }
        return {
            season: null,
            episode: null
        };
    } catch (error) {
        console.warn('Failed to parse season/episode from URL:', url, error);
        return {
            season: null,
            episode: null
        };
    }
}
/** Read and normalize environment variables */ const ENV = {
    BASE: (("TURBOPACK compile-time value", "https://vidsrc.to/embed/movie/") || "").trim(),
    E1: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_1 || "https://111movies.com/${type}/${id}/${season}/${episode}?autoplay=1&theme=23ddc36c&autoNext=1").trim(),
    E2: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_2 || "https://111movies.com/${type}/${id}?autoplay=1&theme=23ddc36c&autoNext=1").trim(),
    E3: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_3 || "").trim(),
    E4: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_4 || "").trim()
};
/** Global extra params appended to every embed URL */ const EXTRA_PARAMS = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_URL_PARAMS || "").trim();
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
].filter(_c = (p)=>!!p.value);
_c1 = VIDEO_PROVIDERS;
/** Extract hostname for friendly server label */ function getServerLabel(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        return 'Unknown Server';
    }
}
/** Build the default embed path for base URLs */ function buildEmbedPath(mediaType, tmdbId, season, episode) {
    if (mediaType === "movie") return "/movie/".concat(tmdbId);
    if (season && episode) return "/tv/".concat(tmdbId, "/").concat(season, "/").concat(episode);
    return "/tv/".concat(tmdbId);
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
        return providerValue.replace(/\$\{id\}/g, String(tmdbId)).replace(/\$\{type\}/g, mediaType).replace(/\$\{season\}/g, season ? String(season) : "1").replace(/\$\{episode\}/g, episode ? String(episode) : "1");
    }
    const base = normalizeBase(providerValue);
    if (mediaType === "tv") {
        return "".concat(base, "/tv/").concat(tmdbId, "?s=").concat(season || 1, "&e=").concat(episode || 1);
    }
    return "".concat(base, "/movie/").concat(tmdbId);
}
function buildEmbedUrl(providerValue, mediaType, tmdbId, season, episode) {
    const raw = buildRawUrl(providerValue, mediaType, tmdbId, season, episode);
    return appendParams(raw, EXTRA_PARAMS);
}
function getEmbedUrlCandidates(mediaType, tmdbId, season, episode) {
    console.log("🔍 Getting embed URL candidates for ".concat(mediaType, " ").concat(tmdbId), {
        season,
        episode
    });
    const urls = VIDEO_PROVIDERS.map((provider)=>{
        const url = buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode);
        console.log("📺 Generated URL for ".concat(provider.name, ": ").concat(url));
        return url;
    });
    const uniqueUrls = [
        ...new Set(urls)
    ];
    console.log("✅ Total unique URLs generated: ".concat(uniqueUrls.length));
    return uniqueUrls;
}
/** Create VideoSource with metadata from provider */ function createVideoSourceWithMetadata(provider, mediaType, tmdbId, season, episode, title, episodeTitle) {
    const url = buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode);
    return {
        url,
        quality: "HD",
        type: "iframe",
        servers: "".concat(provider.name, " (").concat(getServerLabel(url), ")"),
        tmdbId,
        mediaType,
        season,
        episode,
        title,
        episodeTitle
    };
}
async function resolveTmdbId(input, type) {
    if (typeof input === "number" && Number.isFinite(input)) return input;
    const str = String(input).trim();
    const asNum = Number(str);
    if (Number.isFinite(asNum)) return asNum;
    // Handle IMDb IDs
    if (/^tt\d+$/i.test(str)) {
        var _process_env_NEXT_PUBLIC_TMDB_API_KEY;
        const API_KEY = (_process_env_NEXT_PUBLIC_TMDB_API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")) === null || _process_env_NEXT_PUBLIC_TMDB_API_KEY === void 0 ? void 0 : _process_env_NEXT_PUBLIC_TMDB_API_KEY.trim();
        if (!API_KEY) return null;
        try {
            var _results_;
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/find/".concat(str), {
                params: {
                    api_key: API_KEY,
                    external_source: "imdb_id"
                },
                timeout: 5000
            });
            const results = type === "movie" ? data.movie_results : data.tv_results;
            var _results__id;
            return (_results__id = results === null || results === void 0 ? void 0 : (_results_ = results[0]) === null || _results_ === void 0 ? void 0 : _results_.id) !== null && _results__id !== void 0 ? _results__id : null;
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
    /** Get all embed URL candidates for media - ATTACHED to videoApi object */ getEmbedUrlCandidates (mediaType, tmdbId, season, episode) {
        console.log("🎬 videoApi.getEmbedUrlCandidates called:", {
            mediaType,
            tmdbId,
            season,
            episode
        });
        return getEmbedUrlCandidates(mediaType, tmdbId, season, episode);
    },
    /** Get movie video sources with metadata */ async getMovieSources (tmdbId) {
        var _process_env_NEXT_PUBLIC_TMDB_API_KEY;
        console.log("🎬 Getting movie sources for TMDB ID: ".concat(tmdbId));
        const API_KEY = (_process_env_NEXT_PUBLIC_TMDB_API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")) === null || _process_env_NEXT_PUBLIC_TMDB_API_KEY === void 0 ? void 0 : _process_env_NEXT_PUBLIC_TMDB_API_KEY.trim();
        let movieTitle = 'Unknown Movie';
        if (API_KEY) {
            try {
                var _response_data;
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/movie/".concat(tmdbId), {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 5000
                });
                movieTitle = ((_response_data = response.data) === null || _response_data === void 0 ? void 0 : _response_data.title) || movieTitle;
                console.log("📽️ Movie title: ".concat(movieTitle));
            } catch (error) {
                console.warn('Failed to fetch movie title:', error);
            }
        }
        const sources = VIDEO_PROVIDERS.map((provider)=>createVideoSourceWithMetadata(provider, "movie", tmdbId, undefined, undefined, movieTitle));
        console.log("✅ Generated ".concat(sources.length, " movie sources"));
        return sources;
    },
    /** Get TV show video sources with metadata */ async getTVSources (tmdbId, season, episode) {
        var _process_env_NEXT_PUBLIC_TMDB_API_KEY;
        console.log("📺 Getting TV sources for TMDB ID: ".concat(tmdbId, ", S").concat(season, "E").concat(episode));
        const API_KEY = (_process_env_NEXT_PUBLIC_TMDB_API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")) === null || _process_env_NEXT_PUBLIC_TMDB_API_KEY === void 0 ? void 0 : _process_env_NEXT_PUBLIC_TMDB_API_KEY.trim();
        let showTitle = 'Unknown Show';
        let episodeTitle = "Episode ".concat(episode || 1);
        if (API_KEY && season && episode) {
            try {
                const [tvResponse, episodeResponse] = await Promise.allSettled([
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId), {
                        params: {
                            api_key: API_KEY
                        },
                        timeout: 5000
                    }),
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId, "/season/").concat(season, "/episode/").concat(episode), {
                        params: {
                            api_key: API_KEY
                        },
                        timeout: 5000
                    })
                ]);
                if (tvResponse.status === 'fulfilled') {
                    var _tvResponse_value_data;
                    showTitle = ((_tvResponse_value_data = tvResponse.value.data) === null || _tvResponse_value_data === void 0 ? void 0 : _tvResponse_value_data.name) || showTitle;
                    console.log("📺 Show title: ".concat(showTitle));
                }
                if (episodeResponse.status === 'fulfilled') {
                    var _episodeResponse_value_data;
                    episodeTitle = ((_episodeResponse_value_data = episodeResponse.value.data) === null || _episodeResponse_value_data === void 0 ? void 0 : _episodeResponse_value_data.name) || episodeTitle;
                    console.log("🎭 Episode title: ".concat(episodeTitle));
                }
            } catch (error) {
                console.warn('Failed to fetch TV metadata:', error);
            }
        } else if (API_KEY) {
            // Just fetch show title
            try {
                var _response_data;
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId), {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 5000
                });
                showTitle = ((_response_data = response.data) === null || _response_data === void 0 ? void 0 : _response_data.name) || showTitle;
                console.log("📺 Show title: ".concat(showTitle));
            } catch (error) {
                console.warn('Failed to fetch show title:', error);
            }
        }
        const sources = VIDEO_PROVIDERS.map((provider)=>createVideoSourceWithMetadata(provider, "tv", tmdbId, season, episode, showTitle, episodeTitle));
        console.log("✅ Generated ".concat(sources.length, " TV sources"));
        return sources;
    },
    /** Debug helper to log all configured providers */ logConfiguration () {
        console.log('📊 Video API Configuration:', this.getConfigStatus());
        console.log('🔧 Available methods:', Object.keys(this));
        console.log('🔍 getEmbedUrlCandidates available:', typeof this.getEmbedUrlCandidates === 'function');
    }
};
var _c, _c1;
__turbopack_context__.k.register(_c, 'VIDEO_PROVIDERS$[\n  { name: "Primary", value: ENV.E1, priority: 1 },\n  { name: "Secondary", value: ENV.E2, priority: 2 },\n  { name: "Tertiary", value: ENV.E3, priority: 3 },\n  { name: "Backup", value: ENV.E4, priority: 4 },\n  { name: "Base", value: ENV.BASE, priority: 5 },\n].filter');
__turbopack_context__.k.register(_c1, "VIDEO_PROVIDERS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/player/VideoPlayer.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>VideoPlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function VideoPlayer(param) {
    let { mediaId, mediaType, title, season, episode, onClose, loadTimeoutMs = 7000, showControls = true } = param;
    _s();
    const [embedUrl, setEmbedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [candidateUrls, setCandidateUrls] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [sources, setSources] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentSourceIndex, setCurrentSourceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [iframeKey, setIframeKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentSeason, setCurrentSeason] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(season);
    const [currentEpisode, setCurrentEpisode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(episode);
    const [showTitle, setShowTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(title || '');
    const iframeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const attemptIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0); // increments for each tryIndex call
    const timeoutHandleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const failedSetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const exhaustedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    // parse season/episode from URL params if tv
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            if (mediaType === 'tv') {
                const urlSeason = searchParams.get('season');
                const urlEpisode = searchParams.get('episode');
                if (urlSeason && urlEpisode) {
                    setCurrentSeason(parseInt(urlSeason));
                    setCurrentEpisode(parseInt(urlEpisode));
                }
            }
        }
    }["VideoPlayer.useEffect"], [
        searchParams,
        mediaType
    ]);
    // auto-next episode (approx runtime fallback)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            if (mediaType !== 'tv' || !currentEpisode || !currentSeason) return;
            const runtimeMs = 25 * 60 * 1000; // 25 minutes fallback
            const timer = setTimeout({
                "VideoPlayer.useEffect.timer": ()=>{
                    const nextEpisode = (currentEpisode || 1) + 1;
                    router.replace("/watch/tv/".concat(mediaId, "?season=").concat(currentSeason, "&episode=").concat(nextEpisode), {
                        scroll: false
                    });
                    setCurrentEpisode(nextEpisode);
                    setIframeKey({
                        "VideoPlayer.useEffect.timer": (k)=>k + 1
                    }["VideoPlayer.useEffect.timer"]);
                }
            }["VideoPlayer.useEffect.timer"], runtimeMs);
            return ({
                "VideoPlayer.useEffect": ()=>clearTimeout(timer)
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], [
        currentEpisode,
        currentSeason,
        mediaId,
        mediaType,
        router
    ]);
    // clear current attempt timeout
    const clearAttemptTimeout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[clearAttemptTimeout]": ()=>{
            if (timeoutHandleRef.current !== null) {
                window.clearTimeout(timeoutHandleRef.current);
                timeoutHandleRef.current = null;
            }
        }
    }["VideoPlayer.useCallback[clearAttemptTimeout]"], []);
    // pick next index that isn't failed yet; return -1 if none
    const pickNextIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[pickNextIndex]": ()=>{
            const len = candidateUrls.length;
            if (len === 0) return -1;
            for(let i = 1; i <= len; i++){
                const idx = (currentSourceIndex + i) % len;
                if (!failedSetRef.current.has(idx)) return idx;
            }
            return -1;
        }
    }["VideoPlayer.useCallback[pickNextIndex]"], [
        candidateUrls.length,
        currentSourceIndex
    ]);
    // start attempt timeout for an index; uses attemptIdRef to avoid stale timeouts acting
    const startAttempt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[startAttempt]": (idx)=>{
            clearAttemptTimeout();
            attemptIdRef.current += 1;
            const thisAttemptId = attemptIdRef.current;
            timeoutHandleRef.current = window.setTimeout({
                "VideoPlayer.useCallback[startAttempt]": ()=>{
                    // if attempt id still matches, this attempt timed out
                    if (attemptIdRef.current === thisAttemptId) {
                        console.warn("Attempt ".concat(thisAttemptId, " timed out for index ").concat(idx));
                        failedSetRef.current.add(idx);
                        const next = pickNextIndex();
                        if (next === -1) {
                            exhaustedRef.current = true;
                            setError('All video sources failed to load');
                            clearAttemptTimeout();
                        } else {
                            tryIndex(next);
                        }
                    }
                }
            }["VideoPlayer.useCallback[startAttempt]"], loadTimeoutMs);
        }
    }["VideoPlayer.useCallback[startAttempt]"], [
        clearAttemptTimeout,
        loadTimeoutMs,
        pickNextIndex
    ]);
    // attempt to switch to index: sets embedUrl and starts attempt
    const tryIndex = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[tryIndex]": (idx)=>{
            if (!candidateUrls || candidateUrls.length === 0) {
                setError('No video sources available');
                return false;
            }
            if (idx < 0 || idx >= candidateUrls.length) return false;
            // if idx already failed but others exist, pick next available
            if (failedSetRef.current.has(idx) && failedSetRef.current.size < candidateUrls.length) {
                const alt = pickNextIndex();
                if (alt === -1) {
                    exhaustedRef.current = true;
                    setError('All video sources failed to load');
                    return false;
                }
                idx = alt;
            }
            const url = candidateUrls[idx];
            console.log("Attempting source ".concat(idx + 1, "/").concat(candidateUrls.length, ": ").concat(url));
            setCurrentSourceIndex(idx);
            setEmbedUrl(url);
            setIframeKey({
                "VideoPlayer.useCallback[tryIndex]": (k)=>k + 1
            }["VideoPlayer.useCallback[tryIndex]"]);
            setError(null);
            startAttempt(idx);
            return true;
        }
    }["VideoPlayer.useCallback[tryIndex]"], [
        candidateUrls,
        pickNextIndex,
        startAttempt
    ]);
    // try next available
    const tryNext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[tryNext]": ()=>{
            if (!candidateUrls || candidateUrls.length === 0) {
                setError('No video sources available');
                return false;
            }
            if (exhaustedRef.current) {
                setError('All video sources failed to load');
                return false;
            }
            const next = pickNextIndex();
            if (next === -1) {
                exhaustedRef.current = true;
                setError('All video sources failed to load');
                clearAttemptTimeout();
                return false;
            }
            return tryIndex(next);
        }
    }["VideoPlayer.useCallback[tryNext]"], [
        candidateUrls,
        pickNextIndex,
        tryIndex,
        clearAttemptTimeout
    ]);
    // try previous (manual): allow overriding failedSet
    const tryPrev = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[tryPrev]": ()=>{
            if (!candidateUrls || candidateUrls.length === 0) return;
            const prev = (currentSourceIndex - 1 + candidateUrls.length) % candidateUrls.length;
            failedSetRef.current.delete(prev);
            tryIndex(prev);
        }
    }["VideoPlayer.useCallback[tryPrev]"], [
        candidateUrls,
        currentSourceIndex,
        tryIndex
    ]);
    // iframe events
    const handleIframeLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[handleIframeLoad]": ()=>{
            console.log("Iframe onLoad for index ".concat(currentSourceIndex));
            clearAttemptTimeout();
            attemptIdRef.current = 0;
            failedSetRef.current.delete(currentSourceIndex);
            exhaustedRef.current = false;
            setError(null);
        }
    }["VideoPlayer.useCallback[handleIframeLoad]"], [
        currentSourceIndex,
        clearAttemptTimeout
    ]);
    const handleIframeError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[handleIframeError]": ()=>{
            console.warn("Iframe onError for index ".concat(currentSourceIndex));
            clearAttemptTimeout();
            attemptIdRef.current = 0;
            failedSetRef.current.add(currentSourceIndex);
            const next = pickNextIndex();
            if (next === -1) {
                exhaustedRef.current = true;
                setError('All video sources failed to load');
            } else {
                tryIndex(next);
            }
        }
    }["VideoPlayer.useCallback[handleIframeError]"], [
        currentSourceIndex,
        clearAttemptTimeout,
        pickNextIndex,
        tryIndex
    ]);
    // load candidates from server, fallback to videoApi
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            let cancelled = false;
            const loadCandidates = {
                "VideoPlayer.useEffect.loadCandidates": async ()=>{
                    setCandidateUrls([]);
                    setSources([]);
                    setEmbedUrl('');
                    setCurrentSourceIndex(0);
                    exhaustedRef.current = false;
                    failedSetRef.current.clear();
                    setError(null);
                    try {
                        // try check-embed endpoint (returns list only)
                        try {
                            const res = await fetch('/api/check-embed', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    mediaType,
                                    tmdbId: mediaId,
                                    season: currentSeason || season || 1,
                                    episode: currentEpisode || episode || 1
                                })
                            });
                            if (res.ok) {
                                const data = await res.json();
                                const list = [];
                                if (data.workingUrl) {
                                    if (typeof data.workingUrl === 'string') list.push(data.workingUrl);
                                    else if (typeof data.workingUrl === 'object' && data.workingUrl.url) list.push(data.workingUrl.url);
                                }
                                if (Array.isArray(data.urls) && data.urls.length > 0) {
                                    for (const u of data.urls){
                                        if (u && !list.includes(u)) list.push(u);
                                    }
                                }
                                const final = list.filter(Boolean);
                                if (final.length > 0) {
                                    if (cancelled) return;
                                    setCandidateUrls(final);
                                    // immediately start first attempt
                                    tryIndex(0);
                                    return;
                                }
                            } else {
                                console.warn('check-embed non-OK, falling back');
                            }
                        } catch (err) {
                            console.warn('check-embed failed, falling back', err);
                        }
                        // fallback to videoApi
                        const fallback = mediaType === 'movie' ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["videoApi"].getMovieSources(mediaId) : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["videoApi"].getTVSources(mediaId, currentSeason || season || 1, currentEpisode || episode || 1);
                        if (cancelled) return;
                        setSources(fallback || []);
                        const fallbackUrls = (fallback || []).map({
                            "VideoPlayer.useEffect.loadCandidates.fallbackUrls": (s)=>s.url
                        }["VideoPlayer.useEffect.loadCandidates.fallbackUrls"]).filter(Boolean);
                        if (fallbackUrls.length === 0) {
                            setError('No video sources available');
                            return;
                        }
                        setCandidateUrls(fallbackUrls);
                        tryIndex(0);
                    } catch (err) {
                        console.error('Failed to load video sources:', err);
                        if (!cancelled) setError('Failed to load video sources');
                    }
                }
            }["VideoPlayer.useEffect.loadCandidates"];
            loadCandidates();
            return ({
                "VideoPlayer.useEffect": ()=>{
                    cancelled = true;
                    clearAttemptTimeout();
                }
            })["VideoPlayer.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["VideoPlayer.useEffect"], [
        mediaId,
        mediaType,
        currentSeason,
        currentEpisode
    ]);
    // UI close
    const handleClose = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "VideoPlayer.useCallback[handleClose]": ()=>{
            if (onClose) onClose();
            else router.push('/');
        }
    }["VideoPlayer.useCallback[handleClose]"], [
        onClose,
        router
    ]);
    // ESC to close
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            const onKey = {
                "VideoPlayer.useEffect.onKey": (e)=>{
                    if (e.key === 'Escape') handleClose();
                }
            }["VideoPlayer.useEffect.onKey"];
            document.addEventListener('keydown', onKey);
            return ({
                "VideoPlayer.useEffect": ()=>document.removeEventListener('keydown', onKey)
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], [
        handleClose
    ]);
    // cleanup timeout on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            return ({
                "VideoPlayer.useEffect": ()=>clearAttemptTimeout()
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], [
        clearAttemptTimeout
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: [
            embedUrl && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                        ref: iframeRef,
                        src: embedUrl,
                        className: "w-full h-full",
                        allowFullScreen: true,
                        allow: "autoplay; encrypted-media; picture-in-picture",
                        onLoad: handleIframeLoad,
                        onError: handleIframeError,
                        style: {
                            border: 'none'
                        },
                        title: title || "player-".concat(mediaType, "-").concat(mediaId)
                    }, iframeKey, false, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 310,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 left-4 z-30 flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                className: "p-2 rounded-full bg-black/60 text-white",
                                "aria-label": "Back",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "w-6 h-6"
                                }, void 0, false, {
                                    fileName: "[project]/components/player/VideoPlayer.tsx",
                                    lineNumber: 330,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 325,
                                columnNumber: 13
                            }, this),
                            showTitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-white font-extrabold text-lg truncate max-w-xs",
                                children: showTitle
                            }, void 0, false, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 333,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 324,
                        columnNumber: 11
                    }, this),
                    mediaType === 'tv' && currentSeason && currentEpisode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-1 rounded-md text-white",
                        children: [
                            "S",
                            currentSeason,
                            "E",
                            currentEpisode
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 341,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 right-4 z-30 text-white/80 text-sm flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: "Auto-switch enabled — Press ESC to exit"
                            }, void 0, false, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 348,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs ml-2",
                                children: [
                                    "Source ",
                                    currentSourceIndex + 1,
                                    "/",
                                    candidateUrls.length || 0
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 349,
                                columnNumber: 13
                            }, this),
                            showControls && candidateUrls.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "ml-3 flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: tryPrev,
                                        className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                        children: "Prev"
                                    }, void 0, false, {
                                        fileName: "[project]/components/player/VideoPlayer.tsx",
                                        lineNumber: 352,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: tryNext,
                                        className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                        children: "Next"
                                    }, void 0, false, {
                                        fileName: "[project]/components/player/VideoPlayer.tsx",
                                        lineNumber: 353,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 351,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 347,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-white text-center max-w-md px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-6xl mb-6",
                            children: "⚠️"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 364,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-4",
                            children: "Unable to Play Video"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 365,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300 mb-4",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 366,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleClose,
                                    className: "px-6 py-2 bg-gray-700 rounded",
                                    children: "Go Back"
                                }, void 0, false, {
                                    fileName: "[project]/components/player/VideoPlayer.tsx",
                                    lineNumber: 368,
                                    columnNumber: 15
                                }, this),
                                candidateUrls.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>tryIndex(0),
                                    className: "px-6 py-2 bg-gray-600 rounded",
                                    children: "Retry"
                                }, void 0, false, {
                                    fileName: "[project]/components/player/VideoPlayer.tsx",
                                    lineNumber: 369,
                                    columnNumber: 44
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 367,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/player/VideoPlayer.tsx",
                    lineNumber: 363,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/player/VideoPlayer.tsx",
                lineNumber: 362,
                columnNumber: 9
            }, this),
            !embedUrl && !error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-white text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-4xl mb-4",
                            children: "📺"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 379,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-bold mb-2",
                            children: "No Video Sources Available"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 380,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-400 mb-6",
                            children: "Unable to find any playable video sources for this content"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 381,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg",
                            children: "Go Back"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 382,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/player/VideoPlayer.tsx",
                    lineNumber: 378,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/player/VideoPlayer.tsx",
                lineNumber: 377,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/player/VideoPlayer.tsx",
        lineNumber: 306,
        columnNumber: 5
    }, this);
}
_s(VideoPlayer, "1K9c6y9QhDEzifA4mnXbIJeiUoo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = VideoPlayer;
var _c;
__turbopack_context__.k.register(_c, "VideoPlayer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/watch/[mediatype]/[id]/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// app/watch/[mediatype]/[id]/page.tsx
__turbopack_context__.s({
    "default": ()=>WatchPage
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$player$2f$VideoPlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/player/VideoPlayer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/tmdb.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function WatchPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const [mediaData, setMediaData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const mediaType = params === null || params === void 0 ? void 0 : params.mediatype;
    const id = parseInt(params === null || params === void 0 ? void 0 : params.id);
    // Get season and episode from query params for TV shows
    const season = parseInt(searchParams.get('season') || '1');
    const episode = parseInt(searchParams.get('episode') || '1');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WatchPage.useEffect": ()=>{
            // Hide body scroll for fullscreen experience
            document.body.style.overflow = 'hidden';
            return ({
                "WatchPage.useEffect": ()=>{
                    document.body.style.overflow = 'auto';
                }
            })["WatchPage.useEffect"];
        }
    }["WatchPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WatchPage.useEffect": ()=>{
            async function loadMediaData() {
                try {
                    let data;
                    if (mediaType === 'movie') {
                        data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieDetails(id);
                    } else {
                        data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tmdbApi"].getTVShowDetails(id);
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
        }
    }["WatchPage.useEffect"], [
        id,
        mediaType
    ]);
    const handleClose = ()=>{
        router.back();
    };
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 62,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 bg-black flex items-center justify-center text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-xl font-semibold mb-4",
                        children: "Media not found"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$player$2f$VideoPlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
_s(WatchPage, "Soo03mfq+TexGPImKjjW8fVsSgg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"]
    ];
});
_c = WatchPage;
var _c;
__turbopack_context__.k.register(_c, "WatchPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.539.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s({
    "__iconNode": ()=>__iconNode,
    "default": ()=>ArrowLeft
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "m12 19-7-7 7-7",
            key: "1l729n"
        }
    ],
    [
        "path",
        {
            d: "M19 12H5",
            key: "x3x0zl"
        }
    ]
];
const ArrowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("arrow-left", __iconNode);
;
 //# sourceMappingURL=arrow-left.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "ArrowLeft": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript)");
}),
}]);

//# sourceMappingURL=_114bd77f._.js.map