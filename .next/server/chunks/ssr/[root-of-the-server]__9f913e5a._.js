module.exports = {

"[project]/.next-internal/server/app/page/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

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
    // NEW METHOD: Get detailed season information with episodes
    async getTVSeasonDetails (tvId, seasonNumber) {
        try {
            const data = await request(`/tv/${tvId}/season/${seasonNumber}`, {
                language: 'en-US'
            });
            return data || null;
        } catch (error) {
            console.warn(`[tmdbApi] getTVSeasonDetails failed for TV ${tvId} season ${seasonNumber}:`, error.message);
            return null;
        }
    },
    // NEW METHOD: Get specific episode details
    async getTVEpisodeDetails (tvId, seasonNumber, episodeNumber) {
        try {
            const data = await request(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
                language: 'en-US'
            });
            return data || null;
        } catch (error) {
            console.warn(`[tmdbApi] getTVEpisodeDetails failed for TV ${tvId} S${seasonNumber}E${episodeNumber}:`, error.message);
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
"[project]/components/media/HeroSection.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/HeroSection.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/HeroSection.tsx <module evaluation>", "default");
}),
"[project]/components/media/HeroSection.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/HeroSection.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/HeroSection.tsx", "default");
}),
"[project]/components/media/HeroSection.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$HeroSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/media/HeroSection.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$HeroSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/media/HeroSection.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$HeroSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/media/MediaRow.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/MediaRow.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/MediaRow.tsx <module evaluation>", "default");
}),
"[project]/components/media/MediaRow.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/MediaRow.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/MediaRow.tsx", "default");
}),
"[project]/components/media/MediaRow.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/media/MediaRow.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/media/MediaRow.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/media/WatchlistRow.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/WatchlistRow.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/WatchlistRow.tsx <module evaluation>", "default");
}),
"[project]/components/media/WatchlistRow.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/WatchlistRow.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/WatchlistRow.tsx", "default");
}),
"[project]/components/media/WatchlistRow.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$WatchlistRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/media/WatchlistRow.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$WatchlistRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/media/WatchlistRow.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$WatchlistRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/media/LikedRow.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/LikedRow.tsx <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/LikedRow.tsx <module evaluation>", "default");
}),
"[project]/components/media/LikedRow.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/components/media/LikedRow.tsx from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/media/LikedRow.tsx", "default");
}),
"[project]/components/media/LikedRow.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$LikedRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/media/LikedRow.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$LikedRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/media/LikedRow.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$LikedRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>HomePage,
    "revalidate": ()=>revalidate
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/tmdb.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$HeroSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/media/HeroSection.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/media/MediaRow.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$WatchlistRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/media/WatchlistRow.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$LikedRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/media/LikedRow.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$common$2f$LoadingSpinner$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/common/LoadingSpinner.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
const revalidate = 3600; // 1 hour
// Simple fallback item in case TMDB is unreachable
const mockMovies = [
    {
        id: 1,
        title: 'Demo Movie',
        overview: 'This is a fallback demo movie description.',
        poster_path: null,
        backdrop_path: null,
        release_date: '2025-01-01',
        vote_average: 8,
        vote_count: 1_000,
        genre_ids: [
            28
        ],
        popularity: 99
    }
];
async function getHomePageData() {
    try {
        const connection = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].testConnection();
        if (!connection.success) {
            return {
                trending: mockMovies,
                popular: mockMovies,
                topRated: mockMovies,
                latest: mockMovies,
                popularTV: [],
                topRatedTV: [],
                genres: [],
                isDemo: true,
                error: connection.message
            };
        }
        const [trending, popularRes, topRatedRes, latestRes, popularTVRes, topRatedTVRes, genres] = await Promise.allSettled([
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getTrending(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getPopularMovies(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getTopRatedMovies(),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getLatestReleases('movie', 1),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getTVByCategory('popular'),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getTVByCategory('top-rated'),
            __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieGenres()
        ]);
        const safe = (p, fallback)=>p.status === 'fulfilled' ? p.value : fallback;
        return {
            trending: safe(trending, []).slice(0, 20) || mockMovies,
            popular: safe(popularRes, {
                results: []
            }).results || mockMovies,
            topRated: safe(topRatedRes, {
                results: []
            }).results || mockMovies,
            latest: safe(latestRes, {
                results: []
            }).results || mockMovies,
            popularTV: safe(popularTVRes, {
                results: []
            }).results,
            topRatedTV: safe(topRatedTVRes, {
                results: []
            }).results,
            genres: safe(genres, []),
            isDemo: false,
            error: undefined
        };
    } catch (err) {
        return {
            trending: mockMovies,
            popular: mockMovies,
            topRated: mockMovies,
            latest: mockMovies,
            popularTV: [],
            topRatedTV: [],
            genres: [],
            isDemo: true,
            error: err.message ?? 'Unknown error'
        };
    }
}
async function HomePage() {
    const { trending, popular, topRated, latest, popularTV, topRatedTV, genres, isDemo, error } = await getHomePageData();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-gradient-to-b from-black to-gray-900",
        children: [
            (isDemo || error) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-yellow-500 text-black text-center py-3 text-sm font-medium",
                children: error ? `API Error: ${error}` : 'Showing demo content — Check your TMDB API key or network.'
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 107,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Suspense"], {
                fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$common$2f$LoadingSpinner$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 115,
                    columnNumber: 27
                }, void 0),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$HeroSection$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    media: trending.slice(0, 5)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 pt-16 pb-20 bg-gradient-to-b from-black via-gray-900 to-black space-y-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        title: "Trending Movies",
                        items: trending,
                        genres: genres,
                        category: "trending",
                        mediaType: "movie",
                        priority: true
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        title: "Popular Movies",
                        items: popular,
                        genres: genres,
                        category: "popular",
                        mediaType: "movie"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        title: "Top-Rated Movies",
                        items: topRated,
                        genres: genres,
                        category: "top-rated",
                        mediaType: "movie"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        title: "Latest Movies",
                        items: latest,
                        genres: genres,
                        category: "latest",
                        mediaType: "movie"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 144,
                        columnNumber: 9
                    }, this),
                    popularTV.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        title: "Popular TV Shows",
                        items: popularTV,
                        genres: genres,
                        category: "popular",
                        mediaType: "tv"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 154,
                        columnNumber: 11
                    }, this),
                    topRatedTV.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$MediaRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        title: "Top-Rated TV Shows",
                        items: topRatedTV,
                        genres: genres,
                        category: "top-rated",
                        mediaType: "tv"
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 163,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Suspense"], {
                        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-64"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 173,
                            columnNumber: 29
                        }, void 0),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$WatchlistRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Suspense"], {
                        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-64"
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 176,
                            columnNumber: 29
                        }, void 0),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$media$2f$LikedRow$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 177,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/page.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 105,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__9f913e5a._.js.map