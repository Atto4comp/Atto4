module.exports = {

"[project]/.next-internal/server/app/api/proxy/route/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/app/api/proxy/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

// app/api/proxy/route.ts
__turbopack_context__.s({
    "GET": ()=>GET
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
;
/**
 * Conservative proxy for embed pages.
 * - Accepts ?target=<absolute-url>
 * - Validates host against a whitelist to avoid becoming an open proxy
 * - Fetches the target with timeout + retry/backoff
 * - For HTML responses, rewrites allowed absolute resource URLs to route through this proxy
 * - Returns the fetched response body and content-type (with some security headers removed so iframes can work)
 *
 * NOTE: Keep ALLOWED_HOSTS to plain hostnames (no templates, no querystrings).
 */ const ALLOWED_HOSTS = [
    "vidlink.pro",
    "vidsrc.to",
    "vidsrc.stream",
    "2embed.cc",
    "embedsb.com",
    "doodstream.com",
    "streamtape.com",
    "111movies.com",
    "player.111movies.com",
    "embed.111movies.com"
];
function getHostname(u) {
    try {
        if (!u) return null;
        const hostname = new URL(u).hostname;
        return hostname.replace(/^www\./, "").toLowerCase();
    } catch  {
        return null;
    }
}
function hostAllowed(host) {
    if (!host) return false;
    return ALLOWED_HOSTS.some((h)=>host === h || host.endsWith(`.${h}`));
}
/** Basic sleep for backoff */ const sleep = (ms)=>new Promise((r)=>setTimeout(r, ms));
/**
 * Fetch with timeout + retry/backoff.
 * Returns the fetch Response on success or throws a detailed Error on permanent failure.
 */ async function fetchWithTimeoutAndRetry(url, timeoutMs = 10000, retries = 2) {
    const parsed = new URL(url);
    const origin = parsed.origin;
    // Defensive headers — some hosts block empty UA or require referer/origin
    const baseHeaders = {
        "User-Agent": "Mozilla/5.0 (compatible; Atto4Proxy/1.0)",
        Accept: "*/*",
        // set referer to origin which often helps bypass naive origin checks
        Referer: origin,
        Origin: origin
    };
    for(let attempt = 0; attempt <= retries; attempt++){
        const controller = new AbortController();
        const id = setTimeout(()=>controller.abort(), timeoutMs);
        try {
            const resp = await fetch(url, {
                method: "GET",
                signal: controller.signal,
                headers: baseHeaders,
                // do not forward credentials
                credentials: "omit"
            });
            clearTimeout(id);
            return resp;
        } catch (err) {
            clearTimeout(id);
            const msg = err?.message || String(err);
            const code = err?.code || "";
            // Consider these transient and retryable
            const transient = /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|network|timeout|aborted|Failed to fetch/i.test(msg) || code === "ECONNRESET" || code === "ETIMEDOUT";
            if (attempt === retries || !transient) {
                // final failure: throw with cause
                const e = new Error(`fetch failed (attempt ${attempt + 1}): ${msg}`);
                e.cause = err;
                throw e;
            }
            const backoff = 300 * 2 ** attempt; // 300ms, 600ms, 1200ms...
            console.warn(`Transient fetch error for ${url} (attempt ${attempt + 1}/${retries}). Retrying ${backoff}ms.`, msg);
            await sleep(backoff);
        // loop to retry
        }
    }
    // unreachable
    throw new Error("unreachable fetchWithTimeoutAndRetry");
}
/**
 * Rewrite absolute src/href occurrences to route through this proxy for allowed hosts only.
 * Conservative implementation — rewrites attributes like src="https://host/..." and href="..."
 */ function rewriteAbsoluteUrlsToProxy(htmlText) {
    // Replace src="https://host/..." and href="https://host/..." occurrences
    const replaced = htmlText.replace(/(src|href)=("https?:\/\/[^"]+"|'https?:\/\/[^']+')/gi, (m, attr, quotedUrl)=>{
        const url = quotedUrl.slice(1, -1);
        const host = getHostname(url);
        if (!host) return `${attr}=${quotedUrl}`;
        if (hostAllowed(host)) {
            return `${attr}="/api/proxy?target=${encodeURIComponent(url)}"`;
        }
        return `${attr}=${quotedUrl}`;
    });
    // Also rewrite simple JS string occurrences like "https://host/..." or 'https://host/...'
    const finalText = replaced.replace(/(['"`])(https?:\/\/[^'"` ]+)['"`]/gi, (m, quote, candidate)=>{
        try {
            const host = getHostname(candidate);
            if (host && hostAllowed(host)) {
                return `${quote}/api/proxy?target=${encodeURIComponent(candidate)}${quote}`;
            }
        } catch  {}
        return m;
    });
    return finalText;
}
async function GET(request) {
    try {
        const target = request.nextUrl.searchParams.get("target");
        if (!target) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Missing target query param"
            }, {
                status: 400
            });
        }
        const hostname = getHostname(target);
        if (!hostname) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Invalid target URL"
            }, {
                status: 400
            });
        }
        if (!hostAllowed(hostname)) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Host not allowed",
                host: hostname
            }, {
                status: 403
            });
        }
        // Fetch remote with retries/timeouts
        let resp;
        try {
            resp = await fetchWithTimeoutAndRetry(target, 10000, 2);
        } catch (err) {
            console.error("Proxy fetch failed:", err?.message || err);
            // Surface the error message for easier debugging client-side
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "Failed to fetch target",
                details: err?.message || String(err)
            }, {
                status: 502
            });
        }
        if (!resp) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: "No response from target"
            }, {
                status: 502
            });
        }
        const contentType = resp.headers.get("content-type") || "";
        // If non-2xx, return a diagnostic JSON (helps check-embed figure out what's returned)
        if (!resp.ok) {
            // try to read a snippet of the body
            let snippet = "";
            try {
                const txt = await resp.text();
                snippet = typeof txt === "string" ? txt.slice(0, 2000) : "";
            } catch (e) {
                snippet = "(failed to read body)";
            }
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                status: resp.status,
                statusText: resp.statusText,
                message: `Upstream returned ${resp.status} ${resp.statusText}`,
                bodySnippet: snippet
            }, {
                status: 502
            });
        }
        // HTML -> rewrite allowed absolute links and return rewritten HTML
        if (contentType.includes("text/html")) {
            const text = await resp.text();
            const rewritten = rewriteAbsoluteUrlsToProxy(text);
            return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](rewritten, {
                status: resp.status,
                headers: {
                    "content-type": "text/html; charset=utf-8",
                    // be careful adding CORS here; we want this HTML embeddable by same-origin iframes
                    "x-proxy-by": "Atto4-Proxy"
                }
            });
        }
        // For binary or other content types, forward the bytes and most headers (but strip framing/security headers)
        const arrayBuffer = await resp.arrayBuffer();
        const forwardedHeaders = {};
        resp.headers.forEach((v, k)=>{
            const low = k.toLowerCase();
            // strip headers that would prevent embedding or are hop-by-hop
            if ([
                "content-security-policy",
                "x-frame-options",
                "set-cookie",
                "transfer-encoding",
                "connection"
            ].includes(low)) return;
            forwardedHeaders[k] = v;
        });
        // Ensure content-type is set
        if (!forwardedHeaders["content-type"]) forwardedHeaders["content-type"] = contentType || "application/octet-stream";
        // Mark proxy
        forwardedHeaders["x-proxy-by"] = "Atto4-Proxy";
        // NextResponse expects a BodyInit; Buffer.from works in Node runtime
        return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"](Buffer.from(arrayBuffer), {
            status: resp.status,
            headers: forwardedHeaders
        });
    } catch (err) {
        console.error("Proxy error:", err);
        const message = err instanceof Error ? err.message : String(err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: "Internal proxy error",
            details: message
        }, {
            status: 500
        });
    }
}
}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__46fc59d9._.js.map