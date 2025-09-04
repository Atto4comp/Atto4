module.exports = {

"[project]/.next-internal/server/app/watch/[mediatype]/[id]/page/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/favicon.ico.mjs { IMAGE => \"[project]/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/app/loading.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/loading.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/stream [external] (stream, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}}),
"[externals]/http [external] (http, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}}),
"[externals]/https [external] (https, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}}),
"[externals]/url [external] (url, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}}),
"[externals]/fs [external] (fs, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}}),
"[externals]/crypto [external] (crypto, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}}),
"[externals]/assert [external] (assert, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("assert", () => require("assert"));

module.exports = mod;
}}),
"[externals]/tty [external] (tty, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}}),
"[externals]/os [external] (os, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}}),
"[externals]/zlib [external] (zlib, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}}),
"[externals]/events [external] (events, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}}),
"[project]/lib/api/video-api.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// lib/api/video-api.ts
__turbopack_context__.s({
    "buildEmbedUrl": ()=>buildEmbedUrl,
    "buildEmbedUrlFromIndex": ()=>buildEmbedUrlFromIndex,
    "resolveTmdbId": ()=>resolveTmdbId,
    "videoApi": ()=>videoApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-rsc] (ecmascript)");
;
/** Read env and trim. Allow either base URLs or URL templates. */ const ENV = {
    BASE: (("TURBOPACK compile-time value", "https://vidsrc.to/embed/movie/") || "").trim(),
    E1: (process.env.NEXT_PUBLIC_VIDEO_EMBED_1 || "https://iframe.pstream.mov/embed/tmdb-${type}-${id}/1/1?logo=false&tips=false&theme=noir&allinone=true&backlink=  http://192.168.70.253:3000").trim(),
    E2: (process.env.NEXT_PUBLIC_VIDEO_EMBED_2 || "").trim(),
    E3: (process.env.NEXT_PUBLIC_VIDEO_EMBED_3 || "").trim(),
    E4: (process.env.NEXT_PUBLIC_VIDEO_EMBED_4 || "").trim()
};
/** Global extra params (e.g. controls=0&autoplay=1) appended to every embed URL */ const EXTRA_PARAMS = (process.env.NEXT_PUBLIC_VIDEO_URL_PARAMS || "").trim();
/** Providers list (fallback order). Empty strings are filtered out. */ const VIDEO_APIS = [
    {
        name: "Primary",
        value: ENV.E1
    },
    {
        name: "Secondary",
        value: ENV.E2
    },
    {
        name: "Tertiary",
        value: ENV.E3
    },
    {
        name: "Backup",
        value: ENV.E4
    },
    {
        name: "Base",
        value: ENV.BASE
    }
].filter((p)=>!!p.value);
/** Build the default embed path when provider is a base URL (not a template). */ function buildEmbedPath(mediaType, tmdbId, season, episode) {
    if (mediaType === "movie") return `/movie/${tmdbId}`;
    if (season && episode) return `/tv/${tmdbId}/${season}/${episode}`;
    return `/tv/${tmdbId}`;
}
/** Returns true if the provider uses placeholders like ${id} */ function isTemplate(u) {
    return /\$\{id\}/.test(u);
}
/** Normalize base URL (remove trailing slash) */ function normalizeBase(u) {
    return u.endsWith("/") ? u.slice(0, -1) : u;
}
/** Append query string safely */ function appendParams(url, params) {
    if (!params) return url;
    return url + (url.includes("?") ? "&" : "?") + params;
}
/** Build a raw URL from template OR base (no params yet). */ function buildRawUrl(providerValue, mediaType, tmdbId, season, episode) {
    if (isTemplate(providerValue)) {
        // Template mode: replace placeholders
        // Supported placeholders: ${id}, ${type}, ${season}, ${episode}
        return providerValue.replace(/\$\{id\}/g, String(tmdbId)).replace(/\$\{type\}/g, mediaType).replace(/\$\{season\}/g, season ? String(season) : "").replace(/\$\{episode\}/g, episode ? String(episode) : "");
    }
    // Base mode: append our canonical path
    const base = normalizeBase(providerValue);
    return `${base}${buildEmbedPath(mediaType, tmdbId, season, episode)}`;
}
function buildEmbedUrl(providerValue, mediaType, tmdbId, season, episode) {
    const raw = buildRawUrl(providerValue, mediaType, tmdbId, season, episode);
    return appendParams(raw, EXTRA_PARAMS);
}
function buildEmbedUrlFromIndex(providerIndex, mediaType, tmdbId, season, episode) {
    const prov = VIDEO_APIS[providerIndex];
    if (!prov) return "";
    return buildEmbedUrl(prov.value, mediaType, tmdbId, season, episode);
}
function toSource(provName, value, mediaType, tmdbId, season, episode) {
    return {
        url: buildEmbedUrl(value, mediaType, tmdbId, season, episode),
        quality: "HD",
        type: "iframe",
        servers: provName,
        tmdbId,
        mediaType
    };
}
async function resolveTmdbId(input, type) {
    // numeric?
    if (typeof input === "number" && Number.isFinite(input)) return input;
    const s = String(input).trim();
    const asNum = Number(s);
    if (Number.isFinite(asNum)) return asNum;
    // IMDb id?
    if (/^tt\d+$/i.test(s)) {
        const API_KEY = (("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24") || "").trim();
        if (!API_KEY) return null;
        try {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/find/${s}`, {
                params: {
                    api_key: API_KEY,
                    external_source: "imdb_id"
                }
            });
            const arr = type === "movie" ? data.movie_results : data.tv_results;
            return arr?.[0]?.id ?? null;
        } catch  {
            return null;
        }
    }
    return null;
}
const videoApi = {
    hasConfiguredApis () {
        return VIDEO_APIS.length > 0;
    },
    getConfigStatus () {
        return {
            configured: VIDEO_APIS.length,
            apis: VIDEO_APIS.map((a)=>({
                    name: a.name,
                    configured: !!a.value
                }))
        };
    },
    async getMovieSources (tmdbId) {
        return VIDEO_APIS.map((p)=>toSource(p.name, p.value, "movie", tmdbId));
    },
    async getTVSources (tmdbId, season, episode) {
        return VIDEO_APIS.map((p)=>toSource(p.name, p.value, "tv", tmdbId, season, episode));
    },
    async getMovieWithEmbed (tmdbId) {
        const API_KEY = (("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24") || "").trim();
        try {
            const movie = API_KEY ? (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/movie/${tmdbId}`, {
                params: {
                    api_key: API_KEY
                }
            })).data : null;
            const sources = await this.getMovieSources(tmdbId);
            return {
                movie,
                embedUrl: sources[0]?.url || "",
                sources
            };
        } catch  {
            return {
                movie: null,
                embedUrl: "",
                sources: []
            };
        }
    },
    async getTVShowWithEmbed (tmdbId, season, episode) {
        const API_KEY = (("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24") || "").trim();
        try {
            const tvShow = API_KEY ? (await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/tv/${tmdbId}`, {
                params: {
                    api_key: API_KEY
                }
            })).data : null;
            const sources = await this.getTVSources(tmdbId, season, episode);
            return {
                tvShow,
                embedUrl: sources[0]?.url || "",
                sources
            };
        } catch  {
            return {
                tvShow: null,
                embedUrl: "",
                sources: []
            };
        }
    }
};
}),
"[project]/lib/api/tmdb.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "tmdbApi": ()=>tmdbApi
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-rsc] (ecmascript)");
;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = (("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24") || '').trim();
// Warn at startup (non-fatal) so missing env doesn't crash the app on import
if (!API_KEY) {
    console.warn('[tmdb] WARNING: NEXT_PUBLIC_TMDB_API_KEY is not set. TMDB requests will fail until provided.');
}
const tmdbClient = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: TMDB_BASE_URL,
    timeout: 20000,
    headers: {
        Accept: 'application/json',
        'User-Agent': 'Bradfilx/1.0'
    }
});
/**
 * Low-level request helper with retries and clear error classification.
 */ async function request(url, params, maxRetries = 3) {
    if (!API_KEY) {
        throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY at runtime');
    }
    const requestParams = {
        api_key: API_KEY,
        ...params || {}
    };
    for(let attempt = 1; attempt <= maxRetries; attempt++){
        try {
            const res = await tmdbClient.get(url, {
                params: requestParams
            });
            return res.data;
        } catch (err) {
            const isLastAttempt = attempt === maxRetries;
            const status = err?.response?.status;
            const statusText = err?.response?.statusText;
            const serverMsg = err?.response?.data ? JSON.stringify(err.response.data).slice(0, 400) : '';
            if (status === 404) {
                throw new Error(`TMDB 404: resource not found (${url})`);
            }
            if (status === 401) {
                throw new Error('TMDB 401: Invalid or unauthorized API key.');
            }
            const isNetworkError = !!err?.code && [
                'ENOTFOUND',
                'ECONNABORTED',
                'ECONNRESET',
                'ETIMEDOUT'
            ].includes(err.code);
            if (isLastAttempt) {
                let msg = `TMDB request failed (${url})`;
                if (status) msg += ` status=${status}${statusText ? ` ${statusText}` : ''}`;
                if (err.message) msg += ` message=${err.message}`;
                if (serverMsg) msg += ` server=${serverMsg}`;
                throw new Error(msg);
            }
            const delayMs = Math.pow(2, attempt - 1) * 500;
            await new Promise((resolve)=>setTimeout(resolve, delayMs));
        }
    }
    throw new Error('Unexpected error in TMDB request retry loop');
}
const tmdbApi = {
    async getTrending (timeWindow = 'week') {
        try {
            const data = await request(`/trending/movie/${timeWindow}`);
            return data.results || [];
        } catch (error) {
            console.warn('[tmdbApi] getTrending failed:', error.message);
            return [];
        }
    },
    async getTVTrending (timeWindow = 'week') {
        try {
            const data = await request(`/trending/tv/${timeWindow}`);
            return data.results || [];
        } catch (error) {
            console.warn('[tmdbApi] getTVTrending failed:', error.message);
            return [];
        }
    },
    async getPopularMovies (page = 1) {
        try {
            const data = await request('/movie/popular', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getPopularMovies failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getTopRatedMovies (page = 1) {
        try {
            const data = await request('/movie/top_rated', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getTopRatedMovies failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getUpcomingMovies (page = 1) {
        try {
            const data = await request('/movie/upcoming', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getUpcomingMovies failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getNowPlayingMovies (page = 1) {
        try {
            const data = await request('/movie/now_playing', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getNowPlayingMovies failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getPopularTVShows (page = 1) {
        try {
            const data = await request('/tv/popular', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getPopularTVShows failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getTopRatedTVShows (page = 1) {
        try {
            const data = await request('/tv/top_rated', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getTopRatedTVShows failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getOnTheAirTVShows (page = 1) {
        try {
            const data = await request('/tv/on_the_air', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getOnTheAirTVShows failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getAiringTodayTVShows (page = 1) {
        try {
            const data = await request('/tv/airing_today', {
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getAiringTodayTVShows failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getTVByCategory (category, page = 1) {
        try {
            let endpoint = '/tv/popular';
            switch(category){
                case 'popular':
                    endpoint = '/tv/popular';
                    break;
                case 'top-rated':
                    endpoint = '/tv/top_rated';
                    break;
                case 'on-the-air':
                    endpoint = '/tv/on_the_air';
                    break;
                case 'airing-today':
                    endpoint = '/tv/airing_today';
                    break;
                default:
                    endpoint = '/tv/popular';
            }
            const data = await request(endpoint, {
                page
            });
            const filteredResults = (data.results || []).filter((item)=>!!item.name && !!item.first_air_date);
            return {
                results: filteredResults,
                total_pages: data.total_pages || 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getTVByCategory failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async discoverTVShows (params = {}) {
        try {
            const requestParams = {
                page: params.page || 1,
                sort_by: params.sortBy || 'popularity.desc',
                'vote_count.gte': 10
            };
            if (params.genreId) requestParams.with_genres = params.genreId;
            if (params.year) requestParams.first_air_date_year = params.year;
            if (params.minRating) requestParams['vote_average.gte'] = params.minRating;
            const data = await request('/discover/tv', requestParams);
            const filteredResults = (data.results || []).filter((show)=>!!show.name && !!show.first_air_date);
            return {
                results: filteredResults,
                total_pages: data.total_pages || 0
            };
        } catch (error) {
            console.warn('[tmdbApi] discoverTVShows failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getLatestReleases (mediaType = 'movie', page = 1, genreId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const params = {
                sort_by: mediaType === 'tv' ? 'first_air_date.desc' : 'release_date.desc',
                page,
                'vote_count.gte': 10
            };
            if (mediaType === 'movie') params['release_date.lte'] = today;
            if (mediaType === 'tv') params['first_air_date.lte'] = today;
            if (genreId) params.with_genres = genreId;
            const data = await request(`/discover/${mediaType}`, params);
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getLatestReleases failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async searchMulti (query, params) {
        try {
            const data = await request('/search/multi', {
                query,
                ...params || {}
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] searchMulti failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async searchMovies (query, page = 1) {
        try {
            const data = await request('/search/movie', {
                query,
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] searchMovies failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async searchTVShows (query, page = 1) {
        try {
            const data = await request('/search/tv', {
                query,
                page
            });
            const filteredResults = (data.results || []).filter((show)=>!!show.name && !!show.first_air_date);
            return {
                results: filteredResults,
                total_pages: data.total_pages || 0
            };
        } catch (error) {
            console.warn('[tmdbApi] searchTVShows failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getMovieDetails (id) {
        try {
            const data = await request(`/movie/${id}`, {
                append_to_response: 'credits,videos,similar,recommendations'
            });
            return data || null;
        } catch (error) {
            console.warn('[tmdbApi] getMovieDetails failed:', error.message);
            return null;
        }
    },
    async getTVShowDetails (id) {
        try {
            const data = await request(`/tv/${id}`, {
                append_to_response: 'credits,videos,similar,recommendations'
            });
            return data || null;
        } catch (error) {
            console.warn('[tmdbApi] getTVShowDetails failed:', error.message);
            return null;
        }
    },
    async getMovieGenres () {
        try {
            const data = await request('/genre/movie/list');
            return data.genres || [];
        } catch (error) {
            console.warn('[tmdbApi] getMovieGenres failed:', error.message);
            return [];
        }
    },
    async getTVGenres () {
        try {
            const data = await request('/genre/tv/list');
            return data.genres || [];
        } catch (error) {
            console.warn('[tmdbApi] getTVGenres failed:', error.message);
            return [];
        }
    },
    async getAllGenres () {
        try {
            const [movieGenres, tvGenres] = await Promise.all([
                this.getMovieGenres(),
                this.getTVGenres()
            ]);
            return {
                movieGenres,
                tvGenres
            };
        } catch (error) {
            console.warn('[tmdbApi] getAllGenres failed:', error.message);
            return {
                movieGenres: [],
                tvGenres: []
            };
        }
    },
    async getMoviesByGenre (genreId, page = 1) {
        try {
            const data = await request('/discover/movie', {
                with_genres: genreId,
                page
            });
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] getMoviesByGenre failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async getTVShowsByGenre (genreId, page = 1) {
        try {
            return await this.discoverTVShows({
                page,
                genreId,
                sortBy: 'popularity.desc'
            });
        } catch (error) {
            console.warn('[tmdbApi] getTVShowsByGenre failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async discover (mediaType, sortBy = 'popularity.desc', page = 1, genreId) {
        try {
            const params = {
                sort_by: sortBy,
                page
            };
            if (genreId) params.with_genres = genreId;
            const data = await request(`/discover/${mediaType}`, params);
            return data || {
                results: [],
                total_pages: 0
            };
        } catch (error) {
            console.warn('[tmdbApi] discover failed:', error.message);
            return {
                results: [],
                total_pages: 0
            };
        }
    },
    async testConnection () {
        try {
            const data = await request('/configuration');
            if (data && data.images) {
                return {
                    success: true,
                    message: 'Connected successfully to TMDB API'
                };
            }
            return {
                success: false,
                message: 'Unexpected response from TMDB configuration'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Unknown connection error'
            };
        }
    },
    /* -----------------------------------------------------------
   *  Unified helper so components never guess the media type.
   *  Usage: await tmdbApi.getDetails(id, 'movie' | 'tv')
   * ----------------------------------------------------------*/ async getDetails (id, type) {
        return type === 'movie' ? this.getMovieDetails(id) : this.getTVShowDetails(id);
    }
};
}),
"[project]/app/watch/[mediatype]/[id]/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// app/watch/[mediatype]/[id]/page.tsx
__turbopack_context__.s({
    "default": ()=>WatchMedia
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-api.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/tmdb.ts [app-rsc] (ecmascript)");
;
;
;
;
async function WatchMedia({ params }) {
    const { mediatype, id } = await params; // ⬅️ required on Next 15
    const mediaType = mediatype === "movie" ? "movie" : "tv";
    const tmdbId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveTmdbId"])(id, mediaType);
    if (!tmdbId) return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const sources = mediaType === "movie" ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["videoApi"].getMovieSources(tmdbId) : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$api$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["videoApi"].getTVSources(tmdbId);
    const embedUrl = sources[0]?.url || "";
    const media = mediaType === "movie" ? await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieDetails(tmdbId) : await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getTVShowDetails(tmdbId);
    const title = media?.title || media?.name || "Untitled";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-black text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "p-4",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-2xl font-bold mb-4",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                !embedUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-4 text-yellow-300",
                    children: [
                        "No embed providers configured. Add",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            children: "NEXT_PUBLIC_VIDEO_EMBED_1..4"
                        }, void 0, false, {
                            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                            lineNumber: 37,
                            columnNumber: 13
                        }, this),
                        " or",
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            children: "NEXT_PUBLIC_VIDEO_API_BASE"
                        }, void 0, false, {
                            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                            lineNumber: 38,
                            columnNumber: 13
                        }, this),
                        " in ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                            children: ".env.local"
                        }, void 0, false, {
                            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                            lineNumber: 38,
                            columnNumber: 56
                        }, this),
                        "."
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 35,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full h-[80vh]",
                    children: embedUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                        src: embedUrl,
                        className: "w-full h-full rounded-lg",
                        allowFullScreen: true,
                        frameBorder: "0",
                        allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 44,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full h-full grid place-items-center bg-neutral-900 rounded-lg",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-neutral-300",
                            children: "No video source available."
                        }, void 0, false, {
                            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                            lineNumber: 53,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                        lineNumber: 52,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 42,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
        lineNumber: 30,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/watch/[mediatype]/[id]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/watch/[mediatype]/[id]/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__dc494018._.js.map