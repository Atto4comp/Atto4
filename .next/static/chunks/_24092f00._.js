(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/lib/api/video-common.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-common.ts
__turbopack_context__.s({
    "COMMON_ENV": ()=>COMMON_ENV,
    "COMMON_PROVIDERS": ()=>COMMON_PROVIDERS,
    "ENV": ()=>COMMON_ENV,
    "EXTRA_PARAMS": ()=>EXTRA_PARAMS,
    "appendParams": ()=>appendParams,
    "buildEmbedPath": ()=>buildEmbedPath,
    "buildEmbedUrl": ()=>buildEmbedUrl,
    "buildRawUrl": ()=>buildRawUrl,
    "checkEmbedUrls": ()=>checkEmbedUrls,
    "createVideoSourceFromProvider": ()=>createVideoSourceFromProvider,
    "getEmbedUrlCandidatesFromProviders": ()=>getEmbedUrlCandidatesFromProviders,
    "getServerLabel": ()=>getServerLabel,
    "normalizeBase": ()=>normalizeBase,
    "resolveTmdbId": ()=>resolveTmdbId,
    "validateConfiguration": ()=>validateConfiguration
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const COMMON_ENV = {
    BASE: (("TURBOPACK compile-time value", "https://vidsrc.to/embed/movie/") || "").trim(),
    E1: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_1 || "").trim(),
    E2: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_2 || "").trim(),
    E3: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_3 || "").trim(),
    E4: (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_EMBED_4 || "").trim(),
    TMDB_API_KEY: (("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24") || "").trim()
};
const EXTRA_PARAMS = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_VIDEO_URL_PARAMS || "").trim();
/** Helpers */ function isTemplateLocal(url) {
    if (!url) return false;
    return /\$\{(id|type|season|episode)\}/.test(url);
}
function getServerLabel(url) {
    if (!url) return 'Unknown Server';
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch (e) {
        return 'Unknown Server';
    }
}
function normalizeBase(url) {
    if (!url) return '';
    return url.endsWith('/') ? url.slice(0, -1) : url;
}
function appendParams(url, params) {
    if (!params) return url;
    return url + (url.includes('?') ? '&' : '?') + params;
}
function buildEmbedPath(mediaType, tmdbId, season, episode) {
    if (mediaType === 'movie') return "/movie/".concat(tmdbId);
    if (mediaType === 'tv') {
        if (season && episode) return "/tv/".concat(tmdbId, "/").concat(season, "/").concat(episode);
        return "/tv/".concat(tmdbId);
    }
    throw new Error('invalid mediaType');
}
function buildRawUrl(providerValue, mediaType, tmdbId, season, episode) {
    if (!providerValue) throw new Error('providerValue required');
    if (isTemplateLocal(providerValue)) {
        return providerValue.replace(/\$\{id\}/g, String(tmdbId)).replace(/\$\{type\}/g, mediaType).replace(/\$\{season\}/g, String(season || 1)).replace(/\$\{episode\}/g, String(episode || 1));
    }
    const base = normalizeBase(providerValue);
    const path = buildEmbedPath(mediaType, tmdbId, season, episode);
    return "".concat(base).concat(path);
}
function buildEmbedUrl(providerValue, mediaType, tmdbId, season, episode) {
    const raw = buildRawUrl(providerValue, mediaType, tmdbId, season, episode);
    return appendParams(raw, EXTRA_PARAMS);
}
function getEmbedUrlCandidatesFromProviders(providers, mediaType, tmdbId, season, episode) {
    const urls = providers.map((p)=>buildEmbedUrl(p.value, mediaType, tmdbId, season, episode));
    return [
        ...new Set(urls)
    ];
}
const COMMON_PROVIDERS = [
    {
        name: 'Primary',
        value: COMMON_ENV.E1,
        priority: 1,
        mediaTypes: [
            'movie',
            'tv'
        ],
        isTemplate: isTemplateLocal(COMMON_ENV.E1),
        hostname: getServerLabel(COMMON_ENV.E1)
    },
    {
        name: 'Secondary',
        value: COMMON_ENV.E2,
        priority: 2,
        mediaTypes: [
            'movie',
            'tv'
        ],
        isTemplate: isTemplateLocal(COMMON_ENV.E2),
        hostname: getServerLabel(COMMON_ENV.E2)
    },
    {
        name: 'Tertiary',
        value: COMMON_ENV.E3,
        priority: 3,
        mediaTypes: [
            'movie',
            'tv'
        ],
        isTemplate: isTemplateLocal(COMMON_ENV.E3),
        hostname: getServerLabel(COMMON_ENV.E3)
    },
    {
        name: 'Backup',
        value: COMMON_ENV.E4,
        priority: 4,
        mediaTypes: [
            'movie',
            'tv'
        ],
        isTemplate: isTemplateLocal(COMMON_ENV.E4),
        hostname: getServerLabel(COMMON_ENV.E4)
    },
    {
        name: 'Base',
        value: COMMON_ENV.BASE,
        priority: 5,
        mediaTypes: [
            'movie',
            'tv'
        ],
        isTemplate: isTemplateLocal(COMMON_ENV.BASE),
        hostname: getServerLabel(COMMON_ENV.BASE)
    }
].filter(_c = (p)=>!!p.value);
_c1 = COMMON_PROVIDERS;
async function checkEmbedUrls(mediaType, tmdbId, season, episode) {
    let testUrls = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : true;
    try {
        const res = await fetch('/api/check-embed', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                mediaType,
                tmdbId,
                season,
                episode,
                testUrls
            })
        });
        if (!res.ok) return null;
        const payload = await res.json();
        return payload;
    } catch (err) {
        console.error('checkEmbedUrls error', err);
        return null;
    }
}
async function resolveTmdbId(input, type) {
    if (typeof input === 'number' && Number.isFinite(input)) return input;
    const s = String(input).trim();
    if (!s) return null;
    const asNum = Number(s);
    if (Number.isFinite(asNum)) return asNum;
    if (/^tt\d+$/i.test(s)) {
        if (!COMMON_ENV.TMDB_API_KEY) return null;
        try {
            var _results_;
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/find/".concat(s), {
                params: {
                    api_key: COMMON_ENV.TMDB_API_KEY,
                    external_source: 'imdb_id'
                },
                timeout: 5000
            });
            const results = type === 'movie' ? data.movie_results : data.tv_results;
            var _results__id;
            return (_results__id = results === null || results === void 0 ? void 0 : (_results_ = results[0]) === null || _results_ === void 0 ? void 0 : _results_.id) !== null && _results__id !== void 0 ? _results__id : null;
        } catch (err) {
            console.warn('resolveTmdbId failed', err);
            return null;
        }
    }
    return null;
}
function createVideoSourceFromProvider(provider, mediaType, tmdbId, season, episode) {
    let additional = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : {};
    const url = buildEmbedUrl(provider.value, mediaType, tmdbId, season, episode);
    return {
        url,
        quality: 'HD',
        type: 'iframe',
        servers: "".concat(provider.name, " (").concat(provider.hostname, ")"),
        tmdbId,
        mediaType,
        season,
        episode,
        provider: provider.name,
        ...additional
    };
}
function validateConfiguration() {
    let providers = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : COMMON_PROVIDERS;
    const errors = [];
    const warnings = [];
    if (!providers || providers.length === 0) errors.push('No providers configured');
    if (!COMMON_ENV.TMDB_API_KEY) warnings.push('TMDB API key not set (imdb resolution disabled)');
    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}
;
var _c, _c1;
__turbopack_context__.k.register(_c, "COMMON_PROVIDERS$[\n  { name: 'Primary', value: COMMON_ENV.E1, priority: 1, mediaTypes: ['movie','tv'], isTemplate: isTemplateLocal(COMMON_ENV.E1), hostname: getServerLabel(COMMON_ENV.E1) },\n  { name: 'Secondary', value: COMMON_ENV.E2, priority: 2, mediaTypes: ['movie','tv'], isTemplate: isTemplateLocal(COMMON_ENV.E2), hostname: getServerLabel(COMMON_ENV.E2) },\n  { name: 'Tertiary', value: COMMON_ENV.E3, priority: 3, mediaTypes: ['movie','tv'], isTemplate: isTemplateLocal(COMMON_ENV.E3), hostname: getServerLabel(COMMON_ENV.E3) },\n  { name: 'Backup', value: COMMON_ENV.E4, priority: 4, mediaTypes: ['movie','tv'], isTemplate: isTemplateLocal(COMMON_ENV.E4), hostname: getServerLabel(COMMON_ENV.E4) },\n  { name: 'Base', value: COMMON_ENV.BASE, priority: 5, mediaTypes: ['movie','tv'], isTemplate: isTemplateLocal(COMMON_ENV.BASE), hostname: getServerLabel(COMMON_ENV.BASE) }\n].filter");
__turbopack_context__.k.register(_c1, "COMMON_PROVIDERS");
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
    "default": ()=>__TURBOPACK__default__export__,
    "getMovieEmbedCandidates": ()=>getMovieEmbedCandidates,
    "getMovieSources": ()=>getMovieSources,
    "getMovieSourcesWithTesting": ()=>getMovieSourcesWithTesting,
    "getMovieWithEmbed": ()=>getMovieWithEmbed,
    "movieVideoApi": ()=>movieVideoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
;
;
/**
 * Movie-specific provider/env processing.
 * Module looks for NEXT_PUBLIC_MOVIE_EMBED_1..4 and NEXT_PUBLIC_MOVIE_API_BASE
 * If not present, falls back to COMMON_PROVIDERS.
 */ /** Build providers from env if present */ function buildMovieProviders() {
    const E1 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOVIE_EMBED_1 || "https://cinemaos.tech/player/${id}").trim();
    const E2 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOVIE_EMBED_2 || "").trim();
    const E3 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOVIE_EMBED_3 || "").trim();
    const E4 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOVIE_EMBED_4 || "").trim();
    const BASE = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_MOVIE_API_BASE || "").trim();
    const items = [
        {
            name: 'Primary',
            value: E1,
            priority: 1,
            mediaTypes: [
                'movie'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E1),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E1)
        },
        {
            name: 'Secondary',
            value: E2,
            priority: 2,
            mediaTypes: [
                'movie'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E2),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E2)
        },
        {
            name: 'Tertiary',
            value: E3,
            priority: 3,
            mediaTypes: [
                'movie'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E3),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E3)
        },
        {
            name: 'Backup',
            value: E4,
            priority: 4,
            mediaTypes: [
                'movie'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E4),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E4)
        },
        {
            name: 'Base',
            value: BASE,
            priority: 5,
            mediaTypes: [
                'movie'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(BASE),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(BASE)
        }
    ].filter((p)=>!!p.value);
    // if none specified, fall back to common providers that support movie
    if (items.length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMMON_PROVIDERS"].filter((p)=>p.mediaTypes.includes('movie'));
    }
    return items;
}
/** Get movie providers (computed) */ const MOVIE_PROVIDERS = buildMovieProviders();
async function getMovieSources(tmdbId) {
    if (!tmdbId || tmdbId <= 0) throw new Error("Invalid movie TMDB ID: ".concat(tmdbId));
    const cfg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateConfiguration"])(MOVIE_PROVIDERS);
    if (!cfg.isValid) throw new Error('video configuration invalid: ' + cfg.errors.join('; '));
    const sources = MOVIE_PROVIDERS.map((provider)=>{
        const s = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createVideoSourceFromProvider"])(provider, 'movie', tmdbId, undefined, undefined, {
            title: "Movie ".concat(tmdbId)
        });
        s.servers = "".concat(provider.name, " (").concat(provider.hostname || (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(provider.value), ")");
        s.provider = provider.name;
        return s;
    });
    return sources;
}
async function getMovieSourcesWithTesting(tmdbId) {
    let testUrls = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    const sources = await getMovieSources(tmdbId);
    if (!testUrls) return {
        sources,
        workingSources: sources,
        embedCheckData: null
    };
    const check = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEmbedUrls"])('movie', tmdbId, undefined, undefined, true);
    if (!check) return {
        sources,
        workingSources: sources,
        embedCheckData: null
    };
    const workingSources = check.allUrls.filter((u)=>u.working).map((u)=>{
        const original = sources.find((s)=>s.url === u.originalUrl) || sources[0];
        return {
            ...original,
            url: u.url,
            working: u.working,
            responseTime: u.responseTime,
            error: u.error,
            provider: u.provider,
            servers: "".concat(u.provider, " (").concat(u.working ? 'Working' : 'Failed', ")")
        };
    });
    return {
        sources,
        workingSources,
        embedCheckData: check
    };
}
async function getMovieWithEmbed(tmdbIdInput) {
    let testUrls = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
    var _process_env_NEXT_PUBLIC_TMDB_API_KEY, _movieResp_data, _workingSources_, _sources_, _movieResp_data1;
    const tmdbId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveTmdbId"])(tmdbIdInput, 'movie');
    if (!tmdbId) throw new Error('unresolvable tmdb id');
    // fetch TMDB metadata (optional)
    const API_KEY = (_process_env_NEXT_PUBLIC_TMDB_API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")) === null || _process_env_NEXT_PUBLIC_TMDB_API_KEY === void 0 ? void 0 : _process_env_NEXT_PUBLIC_TMDB_API_KEY.trim();
    const movieResp = API_KEY ? await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/movie/".concat(tmdbId), {
        params: {
            api_key: API_KEY
        },
        timeout: 10000
    }).catch(()=>({
            data: null
        })) : {
        data: null
    };
    const { sources, workingSources, embedCheckData } = await getMovieSourcesWithTesting(tmdbId, testUrls);
    if (movieResp === null || movieResp === void 0 ? void 0 : (_movieResp_data = movieResp.data) === null || _movieResp_data === void 0 ? void 0 : _movieResp_data.title) {
        sources.forEach((s)=>s.title = movieResp.data.title);
        workingSources.forEach((s)=>s.title = movieResp.data.title);
    }
    const embedUrl = ((_workingSources_ = workingSources[0]) === null || _workingSources_ === void 0 ? void 0 : _workingSources_.url) || ((_sources_ = sources[0]) === null || _sources_ === void 0 ? void 0 : _sources_.url) || '';
    return {
        movie: movieResp === null || movieResp === void 0 ? void 0 : movieResp.data,
        embedUrl,
        sources,
        workingSources,
        embedCheckData,
        metadata: {
            tmdbId,
            mediaType: 'movie',
            title: movieResp === null || movieResp === void 0 ? void 0 : (_movieResp_data1 = movieResp.data) === null || _movieResp_data1 === void 0 ? void 0 : _movieResp_data1.title,
            sourcesAvailable: sources.length,
            workingSourcesCount: workingSources.length,
            tested: testUrls,
            timestamp: new Date().toISOString()
        }
    };
}
function getMovieEmbedCandidates(tmdbId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEmbedUrlCandidatesFromProviders"])(MOVIE_PROVIDERS, 'movie', tmdbId);
}
const movieVideoApi = {
    getMovieSources,
    getMovieSourcesWithTesting,
    getMovieWithEmbed,
    getMovieEmbedCandidates
};
const __TURBOPACK__default__export__ = movieVideoApi;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-tv.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-tv.ts
__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__,
    "getTVEmbedCandidates": ()=>getTVEmbedCandidates,
    "getTVShowWithEmbed": ()=>getTVShowWithEmbed,
    "getTVSources": ()=>getTVSources,
    "getTVSourcesWithTesting": ()=>getTVSourcesWithTesting,
    "tvVideoApi": ()=>tvVideoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
;
;
/** Build TV providers from env (module-level) */ function buildTVProviders() {
    const E1 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TV_EMBED_1 || "https://cinemaos.tech/player/${id}/${season}/${episode}").trim();
    const E2 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TV_EMBED_2 || "").trim();
    const E3 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TV_EMBED_3 || "").trim();
    const E4 = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TV_EMBED_4 || "").trim();
    const BASE = (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_TV_API_BASE || "").trim();
    const items = [
        {
            name: 'Primary',
            value: E1,
            priority: 1,
            mediaTypes: [
                'tv'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E1),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E1)
        },
        {
            name: 'Secondary',
            value: E2,
            priority: 2,
            mediaTypes: [
                'tv'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E2),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E2)
        },
        {
            name: 'Tertiary',
            value: E3,
            priority: 3,
            mediaTypes: [
                'tv'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E3),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E3)
        },
        {
            name: 'Backup',
            value: E4,
            priority: 4,
            mediaTypes: [
                'tv'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(E4),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(E4)
        },
        {
            name: 'Base',
            value: BASE,
            priority: 5,
            mediaTypes: [
                'tv'
            ],
            isTemplate: /\$\{(id|type|season|episode)\}/.test(BASE),
            hostname: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(BASE)
        }
    ].filter((p)=>!!p.value);
    if (items.length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["COMMON_PROVIDERS"].filter((p)=>p.mediaTypes.includes('tv'));
    }
    return items;
}
const TV_PROVIDERS = buildTVProviders();
async function getTVSources(tmdbId, season, episode) {
    if (!tmdbId || tmdbId <= 0) throw new Error("Invalid TV TMDB ID: ".concat(tmdbId));
    const sNum = season || 1;
    const eNum = episode || 1;
    const cfg = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateConfiguration"])(TV_PROVIDERS);
    if (!cfg.isValid) throw new Error('video configuration invalid: ' + cfg.errors.join('; '));
    const sources = TV_PROVIDERS.map((provider)=>{
        const src = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createVideoSourceFromProvider"])(provider, 'tv', tmdbId, sNum, eNum, {
            title: "TV ".concat(tmdbId),
            episodeTitle: "S".concat(sNum, "E").concat(eNum)
        });
        src.servers = "".concat(provider.name, " (").concat(provider.hostname || (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getServerLabel"])(provider.value), ")");
        src.provider = provider.name;
        return src;
    });
    return sources;
}
async function getTVSourcesWithTesting(tmdbId, season, episode) {
    let testUrls = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
    const sources = await getTVSources(tmdbId, season, episode);
    if (!testUrls) return {
        sources,
        workingSources: sources,
        embedCheckData: null
    };
    const check = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["checkEmbedUrls"])('tv', tmdbId, season, episode, true);
    if (!check) return {
        sources,
        workingSources: sources,
        embedCheckData: null
    };
    const workingSources = check.allUrls.filter((u)=>u.working).map((u)=>{
        const original = sources.find((s)=>s.url === u.originalUrl) || sources[0];
        return {
            ...original,
            url: u.url,
            working: u.working,
            responseTime: u.responseTime,
            error: u.error,
            provider: u.provider,
            servers: "".concat(u.provider, " (").concat(u.working ? 'Working' : 'Failed', ")")
        };
    });
    return {
        sources,
        workingSources,
        embedCheckData: check
    };
}
async function getTVShowWithEmbed(tmdbIdInput, season, episode) {
    let testUrls = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
    var _process_env_NEXT_PUBLIC_TMDB_API_KEY, _tvInfo_show, _tvInfo_episode, _workingSources_, _sources_, _tvInfo_show1, _tvInfo_episode1;
    const tmdbId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resolveTmdbId"])(tmdbIdInput, 'tv');
    if (!tmdbId) throw new Error('unresolvable tmdb id');
    const sNum = season || 1;
    const eNum = episode || 1;
    // optionally fetch tv/episode metadata (if api key present)
    const API_KEY = (_process_env_NEXT_PUBLIC_TMDB_API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")) === null || _process_env_NEXT_PUBLIC_TMDB_API_KEY === void 0 ? void 0 : _process_env_NEXT_PUBLIC_TMDB_API_KEY.trim();
    let tvInfo = null;
    if (API_KEY) {
        try {
            const [ep, seas, show] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId, "/season/").concat(sNum, "/episode/").concat(eNum), {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 8000
                }).catch(()=>({
                        data: null
                    })),
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId, "/season/").concat(sNum), {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 8000
                }).catch(()=>({
                        data: null
                    })),
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("https://api.themoviedb.org/3/tv/".concat(tmdbId), {
                    params: {
                        api_key: API_KEY
                    },
                    timeout: 8000
                }).catch(()=>({
                        data: null
                    }))
            ]);
            tvInfo = {
                episode: ep.data,
                season: seas.data,
                show: show.data
            };
        } catch (err) {
            tvInfo = null;
        }
    }
    const { sources, workingSources, embedCheckData } = await getTVSourcesWithTesting(tmdbId, sNum, eNum, testUrls);
    if ((tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_show = tvInfo.show) === null || _tvInfo_show === void 0 ? void 0 : _tvInfo_show.name) || (tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode = tvInfo.episode) === null || _tvInfo_episode === void 0 ? void 0 : _tvInfo_episode.name)) {
        var _tvInfo_show2, _tvInfo_episode2;
        const showTitle = (_tvInfo_show2 = tvInfo.show) === null || _tvInfo_show2 === void 0 ? void 0 : _tvInfo_show2.name;
        const episodeTitle = (_tvInfo_episode2 = tvInfo.episode) === null || _tvInfo_episode2 === void 0 ? void 0 : _tvInfo_episode2.name;
        sources.forEach((s)=>{
            s.title = showTitle;
            s.episodeTitle = episodeTitle || "S".concat(sNum, "E").concat(eNum);
        });
        workingSources.forEach((s)=>{
            s.title = showTitle;
            s.episodeTitle = episodeTitle || "S".concat(sNum, "E").concat(eNum);
        });
    }
    const embedUrl = ((_workingSources_ = workingSources[0]) === null || _workingSources_ === void 0 ? void 0 : _workingSources_.url) || ((_sources_ = sources[0]) === null || _sources_ === void 0 ? void 0 : _sources_.url) || '';
    return {
        tvShow: tvInfo === null || tvInfo === void 0 ? void 0 : tvInfo.show,
        episode: tvInfo === null || tvInfo === void 0 ? void 0 : tvInfo.episode,
        season: tvInfo === null || tvInfo === void 0 ? void 0 : tvInfo.season,
        embedUrl,
        sources,
        workingSources,
        embedCheckData,
        metadata: {
            tmdbId,
            mediaType: 'tv',
            season: sNum,
            episode: eNum,
            title: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_show1 = tvInfo.show) === null || _tvInfo_show1 === void 0 ? void 0 : _tvInfo_show1.name,
            episodeTitle: tvInfo === null || tvInfo === void 0 ? void 0 : (_tvInfo_episode1 = tvInfo.episode) === null || _tvInfo_episode1 === void 0 ? void 0 : _tvInfo_episode1.name,
            tested: testUrls,
            timestamp: new Date().toISOString(),
            sourcesAvailable: sources.length,
            workingSourcesCount: workingSources.length
        }
    };
}
function getTVEmbedCandidates(tmdbId, season, episode) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getEmbedUrlCandidatesFromProviders"])(TV_PROVIDERS, 'tv', tmdbId, season, episode);
}
const tvVideoApi = {
    getTVSources,
    getTVSourcesWithTesting,
    getTVShowWithEmbed,
    getTVEmbedCandidates
};
const __TURBOPACK__default__export__ = tvVideoApi;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-api.ts [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
// lib/api/video-api.ts
/**
 * Backwards-compatible shim that delegates to movie/tv APIs.
 * Prefer importing movieVideoApi or tvVideoApi directly from video-movie / video-tv.
 */ __turbopack_context__.s({
    "VIDEO_PROVIDERS": ()=>VIDEO_PROVIDERS,
    "checkEmbedUrls": ()=>checkEmbedUrls,
    "default": ()=>__TURBOPACK__default__export__,
    "getMovieSources": ()=>getMovieSources,
    "getMovieSourcesWithTesting": ()=>getMovieSourcesWithTesting,
    "getMovieWithEmbed": ()=>getMovieWithEmbed,
    "getTVShowWithEmbed": ()=>getTVShowWithEmbed,
    "getTVSources": ()=>getTVSources,
    "getTVSourcesWithTesting": ()=>getTVSourcesWithTesting,
    "videoApi": ()=>videoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-movie.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript)");
;
;
;
;
;
;
function fnOrFallback(maybeFn, fallback) {
    return typeof maybeFn === 'function' ? maybeFn : fallback;
}
const noopAsync = async function() {
    for(var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++){
        _args[_key] = arguments[_key];
    }
    return null;
};
const returnEmptyArray = async function() {
    for(var _len = arguments.length, _args = new Array(_len), _key = 0; _key < _len; _key++){
        _args[_key] = arguments[_key];
    }
    return [];
};
const returnFalse = ()=>false;
const returnEmptyObject = ()=>({});
const returnEmptyString = ()=>"";
var _movieModule_getMovieSources, _hasMovieProviders;
const movie = {
    getMovieSources: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getMovieSources, returnEmptyArray),
    getMovieSourcesWithTesting: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getMovieSourcesWithTesting, (_movieModule_getMovieSources = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getMovieSources) !== null && _movieModule_getMovieSources !== void 0 ? _movieModule_getMovieSources : returnEmptyArray),
    getMovieWithEmbed: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getMovieWithEmbed, noopAsync),
    getMovieEmbedCandidates: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getMovieEmbedCandidates, (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getEmbedUrlCandidatesFromProviders ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getEmbedUrlCandidatesFromProviders(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.COMMON_PROVIDERS || [], 'movie', id) : []),
    hasMovieSourcesConfigured: fnOrFallback((_hasMovieProviders = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.hasMovieProviders) !== null && _hasMovieProviders !== void 0 ? _hasMovieProviders : ()=>false, ()=>false)
};
var _tvModule_getTVSources, _hasTVProviders;
const tv = {
    getTVSources: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getTVSources, returnEmptyArray),
    getTVSourcesWithTesting: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getTVSourcesWithTesting, (_tvModule_getTVSources = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getTVSources) !== null && _tvModule_getTVSources !== void 0 ? _tvModule_getTVSources : returnEmptyArray),
    getTVShowWithEmbed: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getTVShowWithEmbed, noopAsync),
    getTVEmbedCandidates: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getTVEmbedCandidates, (id, s, e)=>__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getEmbedUrlCandidatesFromProviders ? __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getEmbedUrlCandidatesFromProviders(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.COMMON_PROVIDERS || [], 'tv', id, s, e) : []),
    hasTVSourcesConfigured: fnOrFallback((_hasTVProviders = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.hasTVProviders) !== null && _hasTVProviders !== void 0 ? _hasTVProviders : ()=>false, ()=>false)
};
var _getConfigurationStatus, _validateConfiguration;
const common = {
    getEmbedUrlCandidatesFromProviders: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getEmbedUrlCandidatesFromProviders, ()=>[]),
    checkEmbedUrls: fnOrFallback(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.checkEmbedUrls, async ()=>null),
    getConfigurationStatus: fnOrFallback((_getConfigurationStatus = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.getConfigurationStatus) !== null && _getConfigurationStatus !== void 0 ? _getConfigurationStatus : ()=>({}), ()=>({})),
    validateConfiguration: fnOrFallback((_validateConfiguration = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.validateConfiguration) !== null && _validateConfiguration !== void 0 ? _validateConfiguration : ()=>({
            isValid: false,
            errors: [],
            warnings: []
        }), ()=>({
            isValid: false,
            errors: [],
            warnings: []
        })),
    VIDEO_PROVIDERS: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.COMMON_PROVIDERS || []
};
const videoApi = {
    async getMovieSources (tmdbId) {
        return movie.getMovieSources(tmdbId);
    },
    async getMovieSourcesWithTesting (tmdbId) {
        return movie.getMovieSourcesWithTesting(tmdbId);
    },
    async getMovieWithEmbed (tmdbId) {
        return movie.getMovieWithEmbed(tmdbId);
    },
    async getTVSources (tmdbId, season, episode) {
        return tv.getTVSources(tmdbId, season, episode);
    },
    async getTVSourcesWithTesting (tmdbId, season, episode) {
        return tv.getTVSourcesWithTesting(tmdbId, season, episode);
    },
    async getTVShowWithEmbed (tmdbId, season, episode) {
        return tv.getTVShowWithEmbed(tmdbId, season, episode);
    },
    hasConfiguredApis () {
        return Array.isArray(common.VIDEO_PROVIDERS) && common.VIDEO_PROVIDERS.length > 0;
    },
    getConfigStatus () {
        return common.getConfigurationStatus();
    },
    getEmbedUrlCandidates (mediaType, tmdbId, season, episode) {
        return common.getEmbedUrlCandidatesFromProviders(common.VIDEO_PROVIDERS || [], mediaType, tmdbId, season, episode);
    },
    logConfiguration () {
        if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.logConfiguration === 'function') __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__.logConfiguration();
    },
    movie,
    tv,
    common
};
const __TURBOPACK__default__export__ = videoApi;
const getMovieSources = movie.getMovieSources;
const getMovieSourcesWithTesting = movie.getMovieSourcesWithTesting;
const getMovieWithEmbed = movie.getMovieWithEmbed;
const getTVSources = tv.getTVSources;
const getTVSourcesWithTesting = tv.getTVSourcesWithTesting;
const getTVShowWithEmbed = tv.getTVShowWithEmbed;
const checkEmbedUrls = common.checkEmbedUrls;
const VIDEO_PROVIDERS = common.VIDEO_PROVIDERS;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/lib/api/video-api.ts [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$movie$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-movie.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-client] (ecmascript)");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/api/video-api.ts [app-client] (ecmascript) <locals>");
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
                        const fallback = mediaType === 'movie' ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getMovieSources"])(mediaId) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getTVSources"])(mediaId, season || 1, episode || 1);
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
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white/70 text-sm",
                children: "Preparing player…"
            }, void 0, false, {
                fileName: "[project]/components/players/MoviePlayer.tsx",
                lineNumber: 76,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/players/MoviePlayer.tsx",
            lineNumber: 75,
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
                    lineNumber: 54,
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
                                lineNumber: 73,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 68,
                            columnNumber: 13
                        }, this),
                        title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-white font-extrabold text-lg truncate max-w-xs",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 76,
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
                            lineNumber: 78,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/players/TvPlayer.tsx",
                    lineNumber: 67,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 right-4 z-30 text-white/80 text-sm flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: "Auto-switch enabled — Press ESC to exit"
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 84,
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
                            lineNumber: 85,
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
                                    lineNumber: 88,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: next,
                                    className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                    children: "Next"
                                }, void 0, false, {
                                    fileName: "[project]/components/players/TvPlayer.tsx",
                                    lineNumber: 89,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 87,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/players/TvPlayer.tsx",
                    lineNumber: 83,
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
                lineNumber: 96,
                columnNumber: 11
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/players/TvPlayer.tsx",
            lineNumber: 95,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/players/TvPlayer.tsx",
        lineNumber: 51,
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
    const id = parseInt(params === null || params === void 0 ? void 0 : params.id, 10);
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
                    let data = null;
                    if (mediaType === 'movie') {
                        data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieDetails(id);
                    } else if (mediaType === 'tv') {
                        data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["tmdbApi"].getTVShowDetails(id);
                    }
                    if (!cancelled) setMediaData(data);
                } catch (error) {
                    console.error('Failed to load media:', error);
                    if (!cancelled) setMediaData(null);
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
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        children: "Loading..."
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
                        lineNumber: 84,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClose,
                        className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors",
                        children: "Go Back"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 85,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                lineNumber: 83,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 82,
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
            title: title,
            onClose: handleClose,
            // optional tuning:
            guardMs: 6000,
            showControls: true
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 102,
            columnNumber: 7
        }, this);
    }
    if (mediaType === 'tv') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$TvPlayer$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            mediaId: id,
            season: season,
            episode: episode,
            title: title,
            onClose: handleClose,
            // optional tuning values — tweak as desired:
            guardMs: 5000,
            autoNextMs: 25 * 60 * 1000,
            showControls: true
        }, void 0, false, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 115,
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
                    lineNumber: 133,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleClose,
                    className: "px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors",
                    children: "Go Back"
                }, void 0, false, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 134,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 132,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
        lineNumber: 131,
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

//# sourceMappingURL=_24092f00._.js.map