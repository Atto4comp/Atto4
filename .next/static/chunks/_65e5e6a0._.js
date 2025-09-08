(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/api/video-common.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-common.ts
// Shared utilities, types and helpers for video APIs
__turbopack_context__.s({
    "ENV": ()=>ENV,
    "EXTRA_PARAMS": ()=>EXTRA_PARAMS,
    "VIDEO_PROVIDERS": ()=>VIDEO_PROVIDERS,
    "appendParams": ()=>appendParams,
    "buildEmbedPath": ()=>buildEmbedPath,
    "buildEmbedUrl": ()=>buildEmbedUrl,
    "buildRawUrl": ()=>buildRawUrl,
    "checkEmbedUrls": ()=>checkEmbedUrls,
    "createVideoSource": ()=>createVideoSource,
    "getConfigurationStatus": ()=>getConfigurationStatus,
    "getEmbedUrlCandidates": ()=>getEmbedUrlCandidates,
    "getProvidersForMediaType": ()=>getProvidersForMediaType,
    "getServerLabel": ()=>getServerLabel,
    "isTemplate": ()=>isTemplate,
    "logConfiguration": ()=>logConfiguration,
    "normalizeBase": ()=>normalizeBase,
    "resolveTmdbId": ()=>resolveTmdbId,
    "validateConfiguration": ()=>validateConfiguration
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/** Enhanced TMDB ID resolver with better error handling */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
const ENV = {
    BASE: (("TURBOPACK compile-time value", "https://vidsrc.to/embed/movie/") || "").trim(),
    E1: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_1 || "https://cinemaos.tech/player/${id}?autoplay=true").trim(),
    E2: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_2 || "https://cinemaos.tech/player/${id}/${season}/${episode}?autoplay=true&autonext=true").trim(),
    E3: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_3 || "").trim(),
    E4: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_4 || "").trim(),
    TMDB_API_KEY: (("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24") || "").trim()
};
const EXTRA_PARAMS = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_URL_PARAMS || "").trim();
const VIDEO_PROVIDERS = [
    {
        name: "Primary",
        value: ENV.E1,
        priority: 1,
        mediaTypes: [
            "movie",
            "tv"
        ],
        isTemplate: isTemplate(ENV.E1),
        hostname: getServerLabel(ENV.E1)
    },
    {
        name: "Secondary",
        value: ENV.E2,
        priority: 2,
        mediaTypes: [
            "movie",
            "tv"
        ],
        isTemplate: isTemplate(ENV.E2),
        hostname: getServerLabel(ENV.E2)
    },
    {
        name: "Tertiary",
        value: ENV.E3,
        priority: 3,
        mediaTypes: [
            "movie",
            "tv"
        ],
        isTemplate: isTemplate(ENV.E3),
        hostname: getServerLabel(ENV.E3)
    },
    {
        name: "Backup",
        value: ENV.E4,
        priority: 4,
        mediaTypes: [
            "movie",
            "tv"
        ],
        isTemplate: isTemplate(ENV.E4),
        hostname: getServerLabel(ENV.E4)
    },
    {
        name: "Base",
        value: ENV.BASE,
        priority: 5,
        mediaTypes: [
            "movie",
            "tv"
        ],
        isTemplate: isTemplate(ENV.BASE),
        hostname: getServerLabel(ENV.BASE)
    }
].filter(_c = (p)=>!!p.value);
_c1 = VIDEO_PROVIDERS;
function getServerLabel(url) {
    if (!url) return 'Unknown Server';
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        return 'Unknown Server';
    }
}
function buildEmbedPath(mediaType, tmdbId, season, episode) {
    if (!tmdbId || tmdbId <= 0) {
        throw new Error("Invalid TMDB ID: ".concat(tmdbId));
    }
    if (mediaType === "movie") {
        return "/movie/".concat(tmdbId);
    }
    if (mediaType === "tv") {
        if (season && episode) {
            return "/tv/".concat(tmdbId, "/").concat(season, "/").concat(episode);
        }
        return "/tv/".concat(tmdbId);
    }
    throw new Error("Invalid media type: ".concat(mediaType));
}
function isTemplate(url) {
    if (!url) return false;
    return /\$\{(id|type|season|episode)\}/.test(url);
}
function normalizeBase(url) {
    if (!url) return '';
    return url.endsWith("/") ? url.slice(0, -1) : url;
}
function appendParams(url, params) {
    if (!params || !url) return url;
    const separator = url.includes("?") ? "&" : "?";
    return "".concat(url).concat(separator).concat(params);
}
function buildRawUrl(providerValue, mediaType, tmdbId, season, episode) {
    if (!providerValue) {
        throw new Error('Provider value is required');
    }
    if (!tmdbId || tmdbId <= 0) {
        throw new Error("Invalid TMDB ID: ".concat(tmdbId));
    }
    if (isTemplate(providerValue)) {
        // Template mode: replace placeholders
        return providerValue.replace(/\$\{id\}/g, String(tmdbId)).replace(/\$\{type\}/g, mediaType).replace(/\$\{season\}/g, season ? String(season) : "1").replace(/\$\{episode\}/g, episode ? String(episode) : "1");
    }
    // Base mode: append canonical path
    const base = normalizeBase(providerValue);
    const path = buildEmbedPath(mediaType, tmdbId, season, episode);
    return "".concat(base).concat(path);
}
function buildEmbedUrl(providerValue, mediaType, tmdbId, season, episode) {
    try {
        const raw = buildRawUrl(providerValue, mediaType, tmdbId, season, episode);
        return appendParams(raw, EXTRA_PARAMS);
    } catch (error) {
        console.error('Failed to build embed URL:', error);
        throw error;
    }
}
function getProvidersForMediaType(mediaType) {
    return VIDEO_PROVIDERS.filter((provider)=>provider.mediaTypes.includes(mediaType));
}
function getEmbedUrlCandidates(mediaType, tmdbId, season, episode) {
    const providers = getProvidersForMediaType(mediaType);
    const urls = providers.map((provider)=>buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode));
    // Remove duplicates while preserving order
    return [
        ...new Set(urls)
    ];
}
;
async function resolveTmdbId(input, type) {
    // Handle numeric input
    if (typeof input === "number" && Number.isFinite(input) && input > 0) {
        return input;
    }
    const str = String(input).trim();
    if (!str) return null;
    // Handle string numeric input
    const asNum = Number(str);
    if (Number.isFinite(asNum) && asNum > 0) {
        return asNum;
    }
    // Handle IMDb IDs
    if (/^tt\d+$/i.test(str)) {
        if (!ENV.TMDB_API_KEY) {
            console.error('TMDB API key is required to resolve IMDb IDs');
            return null;
        }
        try {
            var _results_;
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/find/".concat(str), {
                params: {
                    api_key: ENV.TMDB_API_KEY,
                    external_source: "imdb_id"
                },
                timeout: 5000
            });
            const results = type === "movie" ? data.movie_results : data.tv_results;
            const tmdbId = results === null || results === void 0 ? void 0 : (_results_ = results[0]) === null || _results_ === void 0 ? void 0 : _results_.id;
            if (!tmdbId) {
                console.warn("No TMDB ".concat(type, " found for IMDb ID: ").concat(str));
                return null;
            }
            return tmdbId;
        } catch (error) {
            console.error("Failed to resolve IMDb ID ".concat(str, ":"), error);
            return null;
        }
    }
    console.warn("Invalid input format for TMDB ID resolution: ".concat(str));
    return null;
}
function validateConfiguration() {
    const errors = [];
    const warnings = [];
    // Check if we have any providers
    if (VIDEO_PROVIDERS.length === 0) {
        errors.push('No video providers configured');
    }
    // Check for TMDB API key
    if (!ENV.TMDB_API_KEY) {
        warnings.push('TMDB API key not configured - IMDb ID resolution will not work');
    }
    // Validate provider URLs
    VIDEO_PROVIDERS.forEach((provider)=>{
        if (!provider.value) {
            errors.push('Provider "'.concat(provider.name, '" has empty value'));
            return;
        }
        // Check if template providers have required placeholders
        if (isTemplate(provider.value)) {
            if (!provider.value.includes('${id}')) {
                errors.push('Template provider "'.concat(provider.name, '" missing ${id} placeholder'));
            }
        } else {
            // Check if base URL is valid
            try {
                new URL(provider.value);
            } catch (e) {
                errors.push('Provider "'.concat(provider.name, '" has invalid base URL: ').concat(provider.value));
            }
        }
    });
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
function getConfigurationStatus() {
    const validation = validateConfiguration();
    return {
        providers: {
            total: VIDEO_PROVIDERS.length,
            movie: getProvidersForMediaType('movie').length,
            tv: getProvidersForMediaType('tv').length,
            details: VIDEO_PROVIDERS.map((p)=>({
                    name: p.name,
                    hostname: p.hostname,
                    isTemplate: p.isTemplate,
                    mediaTypes: p.mediaTypes,
                    priority: p.priority
                }))
        },
        environment: {
            tmdbApiKey: !!ENV.TMDB_API_KEY,
            extraParams: EXTRA_PARAMS || 'none'
        },
        validation
    };
}
async function checkEmbedUrls(mediaType, tmdbId, season, episode) {
    let testUrls = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
    try {
        const response = await fetch('/api/check-embed', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mediaType,
                tmdbId,
                season,
                episode,
                testUrls
            })
        });
        if (!response.ok) {
            console.error("Embed check API failed: ".concat(response.status, " ").concat(response.statusText));
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to check embed URLs:', error);
        return null;
    }
}
function createVideoSource(provider, mediaType, tmdbId, season, episode, additionalData) {
    const url = buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode);
    return {
        url,
        quality: "HD",
        type: "iframe",
        servers: "".concat(provider.name, " (").concat(provider.hostname, ")"),
        tmdbId,
        mediaType,
        season,
        episode,
        provider: provider.name,
        ...additionalData
    };
}
function logConfiguration() {
    const status = getConfigurationStatus();
    console.group('🎬 Video Configuration Status');
    console.log('Providers:', status.providers);
    console.log('Environment:', status.environment);
    if (status.validation.errors.length > 0) {
        console.error('Errors:', status.validation.errors);
    }
    if (status.validation.warnings.length > 0) {
        console.warn('Warnings:', status.validation.warnings);
    }
    console.groupEnd();
}
var _c, _c1;
__turbopack_context__.k.register(_c, 'VIDEO_PROVIDERS$[\n  { \n    name: "Primary", \n    value: ENV.E1, \n    priority: 1,\n    mediaTypes: ["movie", "tv"],\n    isTemplate: isTemplate(ENV.E1),\n    hostname: getServerLabel(ENV.E1)\n  },\n  { \n    name: "Secondary", \n    value: ENV.E2, \n    priority: 2,\n    mediaTypes: ["movie", "tv"],\n    isTemplate: isTemplate(ENV.E2),\n    hostname: getServerLabel(ENV.E2)\n  },\n  { \n    name: "Tertiary", \n    value: ENV.E3, \n    priority: 3,\n    mediaTypes: ["movie", "tv"],\n    isTemplate: isTemplate(ENV.E3),\n    hostname: getServerLabel(ENV.E3)\n  },\n  { \n    name: "Backup", \n    value: ENV.E4, \n    priority: 4,\n    mediaTypes: ["movie", "tv"],\n    isTemplate: isTemplate(ENV.E4),\n    hostname: getServerLabel(ENV.E4)\n  },\n  { \n    name: "Base", \n    value: ENV.BASE, \n    priority: 5,\n    mediaTypes: ["movie", "tv"],\n    isTemplate: isTemplate(ENV.BASE),\n    hostname: getServerLabel(ENV.BASE)\n  },\n].filter');
__turbopack_context__.k.register(_c1, "VIDEO_PROVIDERS");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-movie.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-movie.ts
__turbopack_context__.s({
    "getMovieSources": ()=>getMovieSources,
    "getMovieSourcesWithTesting": ()=>getMovieSourcesWithTesting
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
;
/** Movie-specific video API */ /** Get all movie-compatible providers */ function getMovieProviders() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProvidersForMediaType"])('movie');
}
async function getMovieSources(tmdbId) {
    if (!tmdbId || tmdbId <= 0) {
        throw new Error("Invalid movie TMDB ID: ".concat(tmdbId));
    }
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateConfiguration"])();
    if (!config.isValid) {
        console.error('Video configuration errors:', config.errors);
        throw new Error('Invalid video configuration');
    }
    const providers = getMovieProviders();
    if (providers.length === 0) {
        console.warn('No movie-compatible providers configured');
        return [];
    }
    try {
        // create sources but ensure servers label is consistent and helpful
        const sources = providers.map((provider)=>{
            const src = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createVideoSource"])(provider, "movie", tmdbId, undefined, undefined, {
                title: "Movie ".concat(tmdbId)
            });
            // normalize servers label: "Primary (example.com)"
            const hostname = provider.hostname || (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(provider.value || '');
            src.servers = "".concat(provider.name, " (").concat(hostname, ")");
            src.provider = provider.name;
            return src;
        });
        console.log("📽️ Generated ".concat(sources.length, " movie sources for TMDB ID: ").concat(tmdbId));
        return sources;
    } catch (error) {
        console.error("Failed to generate movie sources for TMDB ID ".concat(tmdbId, ":"), error);
        throw error;
    }
}
async function getMovieSourcesWithTesting(tmdbId) {
    let testUrls = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    // (copy your existing implementation here — unchanged)
    const sources = await getMovieSources(tmdbId);
    if (!testUrls) {
        return {
            sources,
            workingSources: sources,
            embedCheckData: null
        };
    }
    const embedCheckData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEmbedUrls"])('movie', tmdbId);
    if (!embedCheckData) {
        console.warn("Failed to test movie sources for TMDB ID: ".concat(tmdbId));
        return {
            sources,
            workingSources: sources,
            embedCheckData: null
        };
    }
    const workingSources = embedCheckData.allUrls.filter((url)=>url.working).map((url)=>{
        const originalSource = sources.find((s)=>s.url === url.originalUrl) || sources[0];
        return {
            ...originalSource,
            url: url.url,
            working: url.working,
            responseTime: url.responseTime,
            error: url.error,
            provider: url.provider,
            servers: "".concat(url.provider, " (").concat(url.working ? 'Working' : 'Failed', ")")
        };
    });
    console.log("🎬 Movie sources tested: ".concat(workingSources.length, "/").concat(sources.length, " working"));
    return {
        sources,
        workingSources,
        embedCheckData
    };
} // ... keep the rest unchanged (getMovieWithEmbed etc.) ...
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-tv.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-tv.ts
__turbopack_context__.s({
    "debugTVApi": ()=>debugTVApi,
    "default": ()=>__TURBOPACK__default__export__,
    "getAdjacentEpisodes": ()=>getAdjacentEpisodes,
    "getSeasonEpisodes": ()=>getSeasonEpisodes,
    "getTVConfigStatus": ()=>getTVConfigStatus,
    "getTVEmbedCandidates": ()=>getTVEmbedCandidates,
    "getTVEpisodeInfo": ()=>getTVEpisodeInfo,
    "getTVShowWithEmbed": ()=>getTVShowWithEmbed,
    "getTVSources": ()=>getTVSources,
    "getTVSourcesWithTesting": ()=>getTVSourcesWithTesting,
    "hasTVSourcesConfigured": ()=>hasTVSourcesConfigured,
    "tvVideoApi": ()=>tvVideoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
;
/** TV-specific video API */ /** Get all TV-compatible providers */ function getTVProviders() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getProvidersForMediaType"])('tv');
}
async function getTVSources(tmdbId, season, episode) {
    if (!tmdbId || tmdbId <= 0) {
        throw new Error("Invalid TV show TMDB ID: ".concat(tmdbId));
    }
    const seasonNum = season || 1;
    const episodeNum = episode || 1;
    if (seasonNum <= 0 || episodeNum <= 0) {
        throw new Error("Invalid season/episode: S".concat(seasonNum, "E").concat(episodeNum));
    }
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateConfiguration"])();
    if (!config.isValid) {
        console.error('Video configuration errors:', config.errors);
        throw new Error('Invalid video configuration');
    }
    const providers = getTVProviders();
    if (providers.length === 0) {
        console.warn('No TV-compatible providers configured');
        return [];
    }
    try {
        const sources = providers.map((provider)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createVideoSource"])(provider, "tv", tmdbId, seasonNum, episodeNum, {
                title: "TV Show ".concat(tmdbId),
                episodeTitle: "S".concat(seasonNum, "E").concat(episodeNum)
            }));
        console.log("📺 Generated ".concat(sources.length, " TV sources for TMDB ID: ").concat(tmdbId, " S").concat(seasonNum, "E").concat(episodeNum));
        return sources;
    } catch (error) {
        console.error("Failed to generate TV sources for TMDB ID ".concat(tmdbId, " S").concat(seasonNum, "E").concat(episodeNum, ":"), error);
        throw error;
    }
}
async function getTVSourcesWithTesting(tmdbId, season, episode) {
    let testUrls = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
    const seasonNum = season || 1;
    const episodeNum = episode || 1;
    const sources = await getTVSources(tmdbId, seasonNum, episodeNum);
    if (!testUrls) {
        return {
            sources,
            workingSources: sources,
            embedCheckData: null
        };
    }
    const embedCheckData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEmbedUrls"])('tv', tmdbId, seasonNum, episodeNum);
    if (!embedCheckData) {
        console.warn("Failed to test TV sources for TMDB ID: ".concat(tmdbId, " S").concat(seasonNum, "E").concat(episodeNum));
        return {
            sources,
            workingSources: sources,
            embedCheckData: null
        };
    }
    const workingSources = embedCheckData.allUrls.filter((url)=>url.working).map((url)=>{
        const originalSource = sources.find((s)=>s.url === url.originalUrl) || sources[0];
        return {
            ...originalSource,
            url: url.url,
            working: url.working,
            responseTime: url.responseTime,
            error: url.error,
            provider: url.provider,
            servers: "".concat(url.provider, " (").concat(url.working ? 'Working' : 'Failed', ")")
        };
    });
    console.log("📺 TV sources tested: ".concat(workingSources.length, "/").concat(sources.length, " working for S").concat(seasonNum, "E").concat(episodeNum));
    return {
        sources,
        workingSources,
        embedCheckData
    };
}
async function getTVEpisodeInfo(tmdbId, season, episode) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY) {
        console.warn('TMDB API key not available for episode info');
        return null;
    }
    try {
        const [episodeResponse, seasonResponse, showResponse] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId, "/season/").concat(season, "/episode/").concat(episode), {
                params: {
                    api_key: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY
                },
                timeout: 8000
            }).catch(()=>({
                    data: null
                })),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId, "/season/").concat(season), {
                params: {
                    api_key: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY
                },
                timeout: 8000
            }).catch(()=>({
                    data: null
                })),
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId), {
                params: {
                    api_key: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY
                },
                timeout: 8000
            }).catch(()=>({
                    data: null
                }))
        ]);
        return {
            episode: episodeResponse.data,
            season: seasonResponse.data,
            show: showResponse.data
        };
    } catch (error) {
        console.error("Failed to fetch TV episode info for ".concat(tmdbId, " S").concat(season, "E").concat(episode, ":"), error);
        return null;
    }
}
async function getTVShowWithEmbed(tmdbId, season, episode) {
    let testUrls = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
    const seasonNum = season || 1;
    const episodeNum = episode || 1;
    const resolvedTmdbId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveTmdbId"])(tmdbId, 'tv');
    if (!resolvedTmdbId) {
        throw new Error("Invalid or unresolvable TV show TMDB ID: ".concat(tmdbId));
    }
    try {
        var _tvInfo_show, _tvInfo_episode, _workingSources_, _sources_, _tvInfo_show1, _tvInfo_episode1, _tvInfo_episode2, _tvInfo_episode3, _tvInfo_show2, _tvInfo_episode4;
        const [tvInfo, sourcesData] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY ? getTVEpisodeInfo(resolvedTmdbId, seasonNum, episodeNum) : Promise.resolve(null),
            getTVSourcesWithTesting(resolvedTmdbId, seasonNum, episodeNum, testUrls)
        ]);
        const { sources, workingSources, embedCheckData } = sourcesData;
        if ((tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_show = tvInfo.show) === null || _tvInfo_show === void 0 ? void 0 : _tvInfo_show.name) || (tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode = tvInfo.episode) === null || _tvInfo_episode === void 0 ? void 0 : _tvInfo_episode.name)) {
            var _tvInfo_show3, _tvInfo_episode5;
            const showTitle = (_tvInfo_show3 = tvInfo.show) === null || _tvInfo_show3 === void 0 ? void 0 : _tvInfo_show3.name;
            const episodeTitle = (_tvInfo_episode5 = tvInfo.episode) === null || _tvInfo_episode5 === void 0 ? void 0 : _tvInfo_episode5.name;
            sources.forEach((source)=>{
                source.title = showTitle;
                source.episodeTitle = episodeTitle || "S".concat(seasonNum, "E").concat(episodeNum);
            });
            workingSources.forEach((source)=>{
                source.title = showTitle;
                source.episodeTitle = episodeTitle || "S".concat(seasonNum, "E").concat(episodeNum);
            });
        }
        const primaryEmbedUrl = ((_workingSources_ = workingSources[0]) === null || _workingSources_ === void 0 ? void 0 : _workingSources_.url) || ((_sources_ = sources[0]) === null || _sources_ === void 0 ? void 0 : _sources_.url) || "";
        const result = {
            tvShow: tvInfo === null || tvInfo === void 0 ? void 0 : tvInfo.show,
            episode: tvInfo === null || tvInfo === void 0 ? void 0 : tvInfo.episode,
            season: tvInfo === null || tvInfo === void 0 ? void 0 : tvInfo.season,
            embedUrl: primaryEmbedUrl,
            sources,
            workingSources,
            embedCheckData,
            metadata: {
                tmdbId: resolvedTmdbId,
                mediaType: 'tv',
                season: seasonNum,
                episode: episodeNum,
                title: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_show1 = tvInfo.show) === null || _tvInfo_show1 === void 0 ? void 0 : _tvInfo_show1.name,
                episodeTitle: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode1 = tvInfo.episode) === null || _tvInfo_episode1 === void 0 ? void 0 : _tvInfo_episode1.name,
                airDate: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode2 = tvInfo.episode) === null || _tvInfo_episode2 === void 0 ? void 0 : _tvInfo_episode2.air_date,
                runtime: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode3 = tvInfo.episode) === null || _tvInfo_episode3 === void 0 ? void 0 : _tvInfo_episode3.runtime,
                sourcesAvailable: sources.length,
                workingSourcesCount: workingSources.length,
                tested: testUrls,
                timestamp: new Date().toISOString()
            }
        };
        console.log("📺 TV data prepared:", {
            title: (tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_show2 = tvInfo.show) === null || _tvInfo_show2 === void 0 ? void 0 : _tvInfo_show2.name) || "TV Show ".concat(resolvedTmdbId),
            episode: "S".concat(seasonNum, "E").concat(episodeNum),
            episodeTitle: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode4 = tvInfo.episode) === null || _tvInfo_episode4 === void 0 ? void 0 : _tvInfo_episode4.name,
            sources: sources.length,
            working: workingSources.length,
            primaryUrl: !!primaryEmbedUrl
        });
        return result;
    } catch (error) {
        console.error("Error fetching TV show with embed for TMDB ID ".concat(resolvedTmdbId, " S").concat(seasonNum, "E").concat(episodeNum, ":"), error);
        return {
            tvShow: null,
            episode: null,
            season: null,
            embedUrl: "",
            sources: [],
            workingSources: [],
            embedCheckData: null,
            metadata: {
                tmdbId: resolvedTmdbId,
                mediaType: 'tv',
                season: seasonNum,
                episode: episodeNum,
                title: undefined,
                episodeTitle: undefined,
                airDate: undefined,
                runtime: undefined,
                sourcesAvailable: 0,
                workingSourcesCount: 0,
                tested: testUrls,
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        };
    }
}
function getTVEmbedCandidates(tmdbId, season, episode) {
    if (!tmdbId || tmdbId <= 0) {
        throw new Error("Invalid TV show TMDB ID: ".concat(tmdbId));
    }
    const seasonNum = season || 1;
    const episodeNum = episode || 1;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEmbedUrlCandidates"])('tv', tmdbId, seasonNum, episodeNum);
}
async function getSeasonEpisodes(tmdbId, season) {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY) {
        console.warn('TMDB API key not available for season episodes');
        return null;
    }
    try {
        var _response_data;
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId, "/season/").concat(season), {
            params: {
                api_key: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY
            },
            timeout: 10000
        });
        return ((_response_data = response.data) === null || _response_data === void 0 ? void 0 : _response_data.episodes) || [];
    } catch (error) {
        console.error("Failed to fetch season ".concat(season, " episodes for TV show ").concat(tmdbId, ":"), error);
        return null;
    }
}
async function getAdjacentEpisodes(tmdbId, currentSeason, currentEpisode) {
    const episodes = await getSeasonEpisodes(tmdbId, currentSeason);
    let nextEpisode = null;
    let previousEpisode = null;
    if (episodes) {
        if (currentEpisode < episodes.length) {
            nextEpisode = {
                season: currentSeason,
                episode: currentEpisode + 1
            };
        }
        if (currentEpisode > 1) {
            previousEpisode = {
                season: currentSeason,
                episode: currentEpisode - 1
            };
        }
    }
    return {
        nextEpisode,
        previousEpisode
    };
}
function hasTVSourcesConfigured() {
    return getTVProviders().length > 0;
}
function getTVConfigStatus() {
    const providers = getTVProviders();
    const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateConfiguration"])();
    return {
        available: providers.length > 0,
        providers: providers.map((p)=>({
                name: p.name,
                hostname: p.hostname,
                isTemplate: p.isTemplate,
                priority: p.priority
            })),
        totalProviders: providers.length,
        validation: validation,
        tmdbApiAvailable: !!__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENV"].TMDB_API_KEY
    };
}
function debugTVApi(tmdbId, season, episode) {
    console.group('📺 TV Video API Debug');
    const config = getTVConfigStatus();
    console.log('Configuration:', config);
    if (tmdbId) {
        try {
            const candidates = getTVEmbedCandidates(tmdbId, season, episode);
            console.log("Embed URL candidates for TV ".concat(tmdbId, " S").concat(season || 1, "E").concat(episode || 1, ":"), candidates);
        } catch (error) {
            console.error('Failed to generate candidates:', error);
        }
    }
    console.groupEnd();
}
;
const tvVideoApi = {
    getTVSources,
    getTVSourcesWithTesting,
    getTVShowWithEmbed,
    getTVEmbedCandidates,
    getTVEpisodeInfo,
    getSeasonEpisodes,
    getAdjacentEpisodes,
    hasTVSourcesConfigured,
    getTVConfigStatus,
    debugTVApi,
    resolveTVTmdbId
};
const __TURBOPACK__default__export__ = tvVideoApi;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-tv.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript) <locals>");
}),
"[project]/lib/api/video-api.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-api.ts
/**
 * Compatibility shim for the modular video API.
 *
 * - Re-exports shared types / helpers from video-common
 * - Re-exports movie and tv specific APIs
 * - Provides a `videoApi` object with the legacy API surface that delegates to the new modules
 *
 * Copy-paste this file over your current lib/api/video-api.ts
 */ __turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__,
    "videoApi": ()=>videoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
// Re-export movie-specific module and import its named/default exports
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-movie.ts [app-client] (ecmascript)");
// Re-export tv-specific module and import its named/default exports
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript) <locals>");
;
;
;
;
;
;
const videoApi = {
    // Movie delegates
    async getMovieSources (tmdbId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMovieSources"])(tmdbId);
    },
    async getMovieSourcesWithTesting (tmdbId, testUrls) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMovieSourcesWithTesting"])(tmdbId, testUrls);
    },
    async getMovieWithEmbed (tmdbId) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMovieWithEmbed"])(tmdbId);
    },
    // TV delegates
    async getTVSources (tmdbId, season, episode) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getTVSources"])(tmdbId, season, episode);
    },
    async getTVSourcesWithTesting (tmdbId, season, episode, testUrls) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getTVSourcesWithTesting"])(tmdbId, season, episode, testUrls);
    },
    async getTVShowWithEmbed (tmdbId, season, episode) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getTVShowWithEmbed"])(tmdbId, season, episode);
    },
    // Helpers & configuration
    hasConfiguredApis () {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["VIDEO_PROVIDERS"].length > 0;
    },
    getConfigStatus () {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getConfigurationStatus"])();
    },
    getEmbedUrlCandidates (mediaType, tmdbId, season, episode) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEmbedUrlCandidates"])(mediaType, tmdbId, season, episode);
    },
    logConfiguration () {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logConfiguration"])();
    },
    // Expose movie & tv modules for direct access if desired
    movie: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
    tv: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"]
};
const __TURBOPACK__default__export__ = videoApi;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-api.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-movie.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/api/video-api.ts [app-client] (ecmascript) <locals>");
}),
"[project]/lib/hooks/useEmbedAutoSwitch.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useEmbedAutoSwitch": ()=>useEmbedAutoSwitch
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/lib/api/video-api.ts [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-movie.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript) <locals>");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function useEmbedAutoSwitch(param) {
    let { mediaType, mediaId, season, episode, guardMs = 6000, preferServer = true } = param;
    _s();
    const [candidates, setCandidates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [index, setIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [src, setSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const failed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const attemptId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
    const clearGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEmbedAutoSwitch.useCallback[clearGuard]": ()=>{
            if (timer.current != null) {
                window.clearTimeout(timer.current);
                timer.current = null;
            }
        }
    }["useEmbedAutoSwitch.useCallback[clearGuard]"], []);
    const startGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEmbedAutoSwitch.useCallback[startGuard]": (i)=>{
            clearGuard();
            const thisAttempt = ++attemptId.current;
            timer.current = window.setTimeout({
                "useEmbedAutoSwitch.useCallback[startGuard]": ()=>{
                    // if still same attempt and not loaded — mark failed & next
                    if (attemptId.current === thisAttempt) {
                        failed.current.add(i);
                        // try next
                        let next = -1;
                        for(let step = 1; step <= candidates.length; step++){
                            const cand = (i + step) % candidates.length;
                            if (!failed.current.has(cand)) {
                                next = cand;
                                break;
                            }
                        }
                        if (next >= 0) {
                            setIndex(next);
                            setSrc(candidates[next]);
                            startGuard(next);
                        }
                    }
                }
            }["useEmbedAutoSwitch.useCallback[startGuard]"], guardMs);
        }
    }["useEmbedAutoSwitch.useCallback[startGuard]"], [
        candidates,
        guardMs,
        clearGuard
    ]);
    // load candidate list
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEmbedAutoSwitch.useEffect": ()=>{
            mounted.current = true;
            failed.current.clear();
            setCandidates([]);
            setIndex(0);
            setSrc('');
            ({
                "useEmbedAutoSwitch.useEffect": async ()=>{
                    let list = [];
                    // 1) server-probed list
                    if (preferServer) {
                        try {
                            const res = await fetch('/api/check-embed', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    mediaType,
                                    tmdbId: mediaId,
                                    season: season || 1,
                                    episode: episode || 1,
                                    timeoutMs: 4000,
                                    retries: 0
                                })
                            });
                            if (res.ok) {
                                var _data_workingUrl;
                                const data = await res.json();
                                // Accept either plain string array or array of objects
                                const urls = Array.isArray(data.urls) ? data.urls : [];
                                const normalized = urls.map({
                                    "useEmbedAutoSwitch.useEffect.normalized": (u)=>typeof u === 'string' ? u : u === null || u === void 0 ? void 0 : u.url
                                }["useEmbedAutoSwitch.useEffect.normalized"]).filter(Boolean);
                                var _data_workingUrl_url;
                                // Put workingUrl first if present and not already at front
                                const first = typeof data.workingUrl === 'string' ? data.workingUrl : (_data_workingUrl_url = (_data_workingUrl = data.workingUrl) === null || _data_workingUrl === void 0 ? void 0 : _data_workingUrl.url) !== null && _data_workingUrl_url !== void 0 ? _data_workingUrl_url : null;
                                if (first) {
                                    list = [
                                        first,
                                        ...normalized.filter({
                                            "useEmbedAutoSwitch.useEffect": (u)=>u !== first
                                        }["useEmbedAutoSwitch.useEffect"])
                                    ];
                                } else {
                                    list = normalized;
                                }
                            }
                        } catch (e) {
                        // ignore; fallback below
                        }
                    }
                    // 2) fallback to local providers if needed
                    if (list.length === 0) {
                        const fallback = mediaType === 'movie' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMovieSources"])(mediaId) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getTVSources"])(mediaId, season || 1, episode || 1);
                        list = (fallback || []).map({
                            "useEmbedAutoSwitch.useEffect": (s)=>s.url
                        }["useEmbedAutoSwitch.useEffect"]).filter(Boolean);
                    }
                    list = Array.from(new Set(list)); // unique in order
                    if (!mounted.current) return;
                    setCandidates(list);
                    if (list.length > 0) {
                        setIndex(0);
                        setSrc(list[0]);
                        startGuard(0);
                    }
                }
            })["useEmbedAutoSwitch.useEffect"]();
            return ({
                "useEmbedAutoSwitch.useEffect": ()=>{
                    mounted.current = false;
                    clearGuard();
                }
            })["useEmbedAutoSwitch.useEffect"];
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["useEmbedAutoSwitch.useEffect"], [
        mediaId,
        mediaType,
        season,
        episode,
        preferServer,
        guardMs
    ]);
    const onLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEmbedAutoSwitch.useCallback[onLoad]": ()=>{
            clearGuard();
            // current index succeeded; clear failure flag
            failed.current.delete(index);
        }
    }["useEmbedAutoSwitch.useCallback[onLoad]"], [
        index,
        clearGuard
    ]);
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEmbedAutoSwitch.useCallback[onError]": ()=>{
            clearGuard();
            failed.current.add(index);
            // pick next
            let next = -1;
            for(let step = 1; step <= candidates.length; step++){
                const cand = (index + step) % candidates.length;
                if (!failed.current.has(cand)) {
                    next = cand;
                    break;
                }
            }
            if (next >= 0) {
                setIndex(next);
                setSrc(candidates[next]);
                startGuard(next);
            }
        }
    }["useEmbedAutoSwitch.useCallback[onError]"], [
        index,
        candidates,
        clearGuard,
        startGuard
    ]);
    // optional manual controls
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEmbedAutoSwitch.useCallback[next]": ()=>{
            clearGuard();
            let nextIdx = -1;
            for(let step = 1; step <= candidates.length; step++){
                const cand = (index + step) % candidates.length;
                if (!failed.current.has(cand)) {
                    nextIdx = cand;
                    break;
                }
            }
            if (nextIdx >= 0) {
                setIndex(nextIdx);
                setSrc(candidates[nextIdx]);
                startGuard(nextIdx);
            }
        }
    }["useEmbedAutoSwitch.useCallback[next]"], [
        index,
        candidates,
        clearGuard,
        startGuard
    ]);
    const prev = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useEmbedAutoSwitch.useCallback[prev]": ()=>{
            clearGuard();
            let prevIdx = -1;
            for(let step = 1; step <= candidates.length; step++){
                const cand = (index - step + candidates.length) % candidates.length;
                if (!failed.current.has(cand)) {
                    prevIdx = cand;
                    break;
                }
            }
            if (prevIdx >= 0) {
                setIndex(prevIdx);
                setSrc(candidates[prevIdx]);
                startGuard(prevIdx);
            }
        }
    }["useEmbedAutoSwitch.useCallback[prev]"], [
        index,
        candidates,
        clearGuard,
        startGuard
    ]);
    return {
        src,
        index,
        total: candidates.length,
        onLoad,
        onError,
        next,
        prev,
        setIndex
    };
}
_s(useEmbedAutoSwitch, "N8EwdOwb5XgpM7qbd04QtKj8Jb0=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/players/MoviePlayer.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>MoviePlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hooks/useEmbedAutoSwitch.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function MoviePlayer(param) {
    let { mediaId, title, onClose, guardMs = 6000, showControls = true } = param;
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { src, index, total, onLoad, onError, next, prev } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmbedAutoSwitch"])({
        mediaType: 'movie',
        mediaId,
        guardMs,
        preferServer: true
    });
    const handleClose = ()=>onClose ? onClose() : router.back();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    src: src,
                    className: "w-full h-full",
                    allowFullScreen: true,
                    allow: "autoplay; encrypted-media; picture-in-picture",
                    onLoad: onLoad,
                    onError: onError,
                    style: {
                        border: 'none'
                    },
                    title: title || "movie-".concat(mediaId)
                }, src, false, {
                    fileName: "[project]/components/players/MoviePlayer.tsx",
                    lineNumber: 36,
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
                                fileName: "[project]/components/players/MoviePlayer.tsx",
                                lineNumber: 55,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/players/MoviePlayer.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this),
                        title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-white font-extrabold text-lg truncate max-w-xs",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/components/players/MoviePlayer.tsx",
                            lineNumber: 58,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/players/MoviePlayer.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 right-4 z-30 text-white/80 text-sm flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: "Auto-switch enabled — Press ESC to exit"
                        }, void 0, false, {
                            fileName: "[project]/components/players/MoviePlayer.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs ml-2",
                            children: [
                                "Source ",
                                index + 1,
                                "/",
                                total || 0
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/players/MoviePlayer.tsx",
                            lineNumber: 65,
                            columnNumber: 13
                        }, this),
                        showControls && total > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ml-3 flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: prev,
                                    className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                    children: "Prev"
                                }, void 0, false, {
                                    fileName: "[project]/components/players/MoviePlayer.tsx",
                                    lineNumber: 68,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: next,
                                    className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                    children: "Next"
                                }, void 0, false, {
                                    fileName: "[project]/components/players/MoviePlayer.tsx",
                                    lineNumber: 69,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/players/MoviePlayer.tsx",
                            lineNumber: 67,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/players/MoviePlayer.tsx",
                    lineNumber: 63,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : // No spinner per your request; just a quiet blank + small hint
        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white/70 text-sm",
                children: "Preparing player…"
            }, void 0, false, {
                fileName: "[project]/components/players/MoviePlayer.tsx",
                lineNumber: 77,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/players/MoviePlayer.tsx",
            lineNumber: 76,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/players/MoviePlayer.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
_s(MoviePlayer, "XjyzoDXh8orOrCoLzyKXwdTkOC8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmbedAutoSwitch"]
    ];
});
_c = MoviePlayer;
var _c;
__turbopack_context__.k.register(_c, "MoviePlayer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/components/players/TvPlayer.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>TvPlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hooks/useEmbedAutoSwitch.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function TvPlayer(param) {
    let { mediaId, season, episode, title, onClose, guardMs = 5000, showControls = true, autoNextMs } = param;
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const { src, index, total, onLoad, onError, next, prev } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmbedAutoSwitch"])({
        mediaType: 'tv',
        mediaId,
        season,
        episode,
        guardMs,
        preferServer: true
    });
    const handleClose = ()=>onClose ? onClose() : router.back();
    // optional naive auto-next timer
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TvPlayer.useEffect": ()=>{
            if (!autoNextMs) return;
            const id = window.setTimeout({
                "TvPlayer.useEffect.id": ()=>{
                    const nextEp = (episode || 1) + 1;
                    router.replace("/watch/tv/".concat(mediaId, "?season=").concat(season, "&episode=").concat(nextEp), {
                        scroll: false
                    });
                }
            }["TvPlayer.useEffect.id"], autoNextMs);
            return ({
                "TvPlayer.useEffect": ()=>clearTimeout(id)
            })["TvPlayer.useEffect"];
        }
    }["TvPlayer.useEffect"], [
        autoNextMs,
        episode,
        season,
        mediaId,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    src: src,
                    className: "w-full h-full",
                    allowFullScreen: true,
                    allow: "autoplay; encrypted-media; picture-in-picture",
                    onLoad: onLoad,
                    onError: onError,
                    style: {
                        border: 'none'
                    },
                    title: title || "tv-".concat(mediaId, "-s").concat(season, "e").concat(episode)
                }, src, false, {
                    fileName: "[project]/components/players/TvPlayer.tsx",
                    lineNumber: 55,
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
                                fileName: "[project]/components/players/TvPlayer.tsx",
                                lineNumber: 74,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 69,
                            columnNumber: 13
                        }, this),
                        title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-white font-extrabold text-lg truncate max-w-xs",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 77,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ml-2 text-white/80 text-sm px-2 py-0.5 rounded bg-black/50",
                            children: [
                                "S",
                                season,
                                "E",
                                episode
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 79,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/players/TvPlayer.tsx",
                    lineNumber: 68,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 right-4 z-30 text-white/80 text-sm flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: "Auto-switch enabled — Press ESC to exit"
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 85,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs ml-2",
                            children: [
                                "Source ",
                                index + 1,
                                "/",
                                total || 0
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 86,
                            columnNumber: 13
                        }, this),
                        showControls && total > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ml-3 flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: prev,
                                    className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                    children: "Prev"
                                }, void 0, false, {
                                    fileName: "[project]/components/players/TvPlayer.tsx",
                                    lineNumber: 89,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: next,
                                    className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                    children: "Next"
                                }, void 0, false, {
                                    fileName: "[project]/components/players/TvPlayer.tsx",
                                    lineNumber: 90,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 88,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/players/TvPlayer.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white/70 text-sm",
                children: "Preparing player…"
            }, void 0, false, {
                fileName: "[project]/components/players/TvPlayer.tsx",
                lineNumber: 97,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/players/TvPlayer.tsx",
            lineNumber: 96,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/players/TvPlayer.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_s(TvPlayer, "GpjV2zIK6qcw0w0iU5pCnSjA4+s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEmbedAutoSwitch"]
    ];
});
_c = TvPlayer;
var _c;
__turbopack_context__.k.register(_c, "TvPlayer");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$MoviePlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/players/MoviePlayer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$TvPlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/players/TvPlayer.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/tmdb.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
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
    // Get season and episode from query params for TV shows (default to 1)
    const season = parseInt(searchParams.get('season') || '1', 10);
    const episode = parseInt(searchParams.get('episode') || '1', 10);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WatchPage.useEffect": ()=>{
            // Hide body scroll for fullscreen experience
            const prevOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return ({
                "WatchPage.useEffect": ()=>{
                    document.body.style.overflow = prevOverflow || 'auto';
                }
            })["WatchPage.useEffect"];
        }
    }["WatchPage.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WatchPage.useEffect": ()=>{
            let cancelled = false;
            async function loadMediaData() {
                setLoading(true);
                try {
                    let data;
                    if (mediaType === 'movie') {
                        data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieDetails(id);
                    } else {
                        data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tmdbApi"].getTVShowDetails(id);
                    }
                    if (!cancelled) setMediaData(data);
                } catch (error) {
                    console.error('Failed to load media:', error);
                } finally{
                    if (!cancelled) setLoading(false);
                }
            }
            if (id && (mediaType === 'movie' || mediaType === 'tv')) {
                loadMediaData();
            } else {
                setLoading(false);
            }
            return ({
                "WatchPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["WatchPage.useEffect"];
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
                        lineNumber: 71,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading..."
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                lineNumber: 70,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 69,
            columnNumber: 7
        }, this);
    }
    if (!mediaData && (mediaType === 'movie' || mediaType === 'tv')) {
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
                        lineNumber: 82,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClose,
                        className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors",
                        children: "Go Back"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 83,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                lineNumber: 81,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 80,
            columnNumber: 7
        }, this);
    }
    var _mediaData_title, _ref;
    // Determine a display title (movie.title or tv.name)
    const title = (_ref = (_mediaData_title = mediaData === null || mediaData === void 0 ? void 0 : mediaData.title) !== null && _mediaData_title !== void 0 ? _mediaData_title : mediaData === null || mediaData === void 0 ? void 0 : mediaData.name) !== null && _ref !== void 0 ? _ref : '';
    // Render correct player
    if (mediaType === 'movie') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$MoviePlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            mediaId: id,
            mediaType: "movie",
            title: title,
            onClose: handleClose
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 100,
            columnNumber: 7
        }, this);
    }
    if (mediaType === 'tv') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$TvPlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            mediaId: id,
            mediaType: "tv",
            season: season,
            episode: episode,
            title: title,
            onClose: handleClose,
            // optional tuning values — tweak as desired:
            guardMs: 5000,
            autoNextMs: 25 * 60 * 1000
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, this);
    }
    // Fallback for unknown mediatype
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black flex items-center justify-center text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-xl font-semibold mb-4",
                    children: "Unsupported media type"
                }, void 0, false, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleClose,
                    className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors",
                    children: "Go Back"
                }, void 0, false, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 130,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 128,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
        lineNumber: 127,
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

//# sourceMappingURL=_65e5e6a0._.js.map