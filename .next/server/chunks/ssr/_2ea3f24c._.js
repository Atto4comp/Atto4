module.exports = {

"[project]/lib/hooks/useEmbedAutoSwitch.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "useEmbedAutoSwitch": ()=>useEmbedAutoSwitch
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/lib/api/video-api'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
'use client';
;
;
function useEmbedAutoSwitch({ mediaType, mediaId, season, episode, guardMs = 6000, preferServer = true }) {
    const [candidates, setCandidates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [index, setIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [src, setSrc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const failed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const timer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const attemptId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    const mounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(true);
    const clearGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (timer.current != null) {
            window.clearTimeout(timer.current);
            timer.current = null;
        }
    }, []);
    const startGuard = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((i)=>{
        clearGuard();
        const thisAttempt = ++attemptId.current;
        timer.current = window.setTimeout(()=>{
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
        }, guardMs);
    }, [
        candidates,
        guardMs,
        clearGuard
    ]);
    // load candidate list
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        mounted.current = true;
        failed.current.clear();
        setCandidates([]);
        setIndex(0);
        setSrc('');
        (async ()=>{
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
                        const data = await res.json();
                        // Accept either plain string array or array of objects
                        const urls = Array.isArray(data.urls) ? data.urls : [];
                        const normalized = urls.map((u)=>typeof u === 'string' ? u : u?.url).filter(Boolean);
                        // Put workingUrl first if present and not already at front
                        const first = typeof data.workingUrl === 'string' ? data.workingUrl : data.workingUrl?.url ?? null;
                        if (first) {
                            list = [
                                first,
                                ...normalized.filter((u)=>u !== first)
                            ];
                        } else {
                            list = normalized;
                        }
                    }
                } catch  {
                // ignore; fallback below
                }
            }
            // 2) fallback to local providers if needed
            if (list.length === 0) {
                const fallback = mediaType === 'movie' ? await getMovieSources(mediaId) : await getTVSources(mediaId, season || 1, episode || 1);
                list = (fallback || []).map((s)=>s.url).filter(Boolean);
            }
            list = Array.from(new Set(list)); // unique in order
            if (!mounted.current) return;
            setCandidates(list);
            if (list.length > 0) {
                setIndex(0);
                setSrc(list[0]);
                startGuard(0);
            }
        })();
        return ()=>{
            mounted.current = false;
            clearGuard();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        mediaId,
        mediaType,
        season,
        episode,
        preferServer,
        guardMs
    ]);
    const onLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        clearGuard();
        // current index succeeded; clear failure flag
        failed.current.delete(index);
    }, [
        index,
        clearGuard
    ]);
    const onError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
    }, [
        index,
        candidates,
        clearGuard,
        startGuard
    ]);
    // optional manual controls
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
    }, [
        index,
        candidates,
        clearGuard,
        startGuard
    ]);
    const prev = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
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
    }, [
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
}),
"[project]/components/players/MoviePlayer.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>MoviePlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/hooks/useEmbedAutoSwitch.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function MoviePlayer({ mediaId, title, onClose, guardMs = 6000, showControls = true }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { src, index, total, onLoad, onError, next, prev } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$hooks$2f$useEmbedAutoSwitch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEmbedAutoSwitch"])({
        mediaType: 'movie',
        mediaId,
        guardMs,
        preferServer: true
    });
    const handleClose = ()=>onClose ? onClose() : router.back();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: src ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                    src: src,
                    className: "w-full h-full",
                    allowFullScreen: true,
                    allow: "autoplay; encrypted-media; picture-in-picture",
                    onLoad: onLoad,
                    onError: onError,
                    style: {
                        border: 'none'
                    },
                    title: title || `movie-${mediaId}`
                }, src, false, {
                    fileName: "[project]/components/players/MoviePlayer.tsx",
                    lineNumber: 36,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 left-4 z-30 flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "p-2 rounded-full bg-black/60 text-white",
                            "aria-label": "Back",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
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
                        title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute top-4 right-4 z-30 text-white/80 text-sm flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: "Auto-switch enabled — Press ESC to exit"
                        }, void 0, false, {
                            fileName: "[project]/components/players/MoviePlayer.tsx",
                            lineNumber: 64,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        showControls && total > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "ml-3 flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: prev,
                                    className: "px-2 py-1 bg-black/60 rounded hover:bg-black/80",
                                    children: "Prev"
                                }, void 0, false, {
                                    fileName: "[project]/components/players/MoviePlayer.tsx",
                                    lineNumber: 68,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
}),
"[project]/lib/api/video-common.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "buildEmbedUrl": ()=>buildEmbedUrl,
    "getServerLabel": ()=>getServerLabel,
    "resolveTmdbId": ()=>resolveTmdbId
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/axios/lib/axios.js [app-ssr] (ecmascript)");
;
function getServerLabel(url) {
    if (!url) return 'Unknown Server';
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace(/^www\./, '');
    } catch  {
        return 'Unknown Server';
    }
}
function buildEmbedUrl(providerValue, mediaType, tmdbId, season, episode) {
    if (!providerValue) throw new Error('Provider URL required');
    // Handle template URLs (${id}, ${season}, ${episode})
    if (/\$\{.*\}/.test(providerValue)) {
        return providerValue.replace(/\$\{id\}/g, String(tmdbId)).replace(/\$\{type\}/g, mediaType).replace(/\$\{season\}/g, String(season || 1)).replace(/\$\{episode\}/g, String(episode || 1));
    }
    // Handle base URLs - build path
    const base = providerValue.endsWith('/') ? providerValue.slice(0, -1) : providerValue;
    if (mediaType === 'movie') {
        return `${base}/movie/${tmdbId}`;
    } else {
        return `${base}/tv/${tmdbId}/${season || 1}/${episode || 1}`;
    }
}
async function resolveTmdbId(input, type) {
    // Handle numeric input
    if (typeof input === 'number' && Number.isFinite(input)) return input;
    const s = String(input).trim();
    if (!s) return null;
    // Handle string numeric
    const asNum = Number(s);
    if (Number.isFinite(asNum)) return asNum;
    // Handle IMDb IDs
    if (/^tt\d+$/i.test(s)) {
        const API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")?.trim();
        if (!API_KEY) {
            console.warn('TMDB API key required for IMDb ID resolution');
            return null;
        }
        try {
            const { data } = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].get(`https://api.themoviedb.org/3/find/${s}`, {
                params: {
                    api_key: API_KEY,
                    external_source: 'imdb_id'
                },
                timeout: 5000
            });
            const results = type === 'movie' ? data.movie_results : data.tv_results;
            return results?.[0]?.id ?? null;
        } catch (err) {
            console.warn('IMDb ID resolution failed:', err);
            return null;
        }
    }
    return null;
}
}),
"[project]/lib/api/video-tv.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>__TURBOPACK__default__export__,
    "getTVEmbed": ()=>getTVEmbed
});
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-common.ts [app-ssr] (ecmascript)");
;
function getTVProviders() {
    const providers = [
        process.env.NEXT_PUBLIC_TV_EMBED_1 || "https://cinemaos.tech/player/${id}/${season}/${episode}",
        process.env.NEXT_PUBLIC_TV_EMBED_2 || "",
        process.env.NEXT_PUBLIC_TV_EMBED_3 || "",
        process.env.NEXT_PUBLIC_TV_EMBED_4 || "",
        process.env.NEXT_PUBLIC_TV_API_BASE || ""
    ].filter((p)=>p.trim());
    return providers.length > 0 ? providers : [
        "https://cinemaos.tech/player/${id}/${season}/${episode}"
    ];
}
function getTVEmbed(id) {
    const providers = getTVProviders();
    const providerUrl = providers[0];
    // Direct template replacement - instant
    const embedUrl = providerUrl.replace(/\$\{id\}/g, String(id)).replace(/\$\{season\}/g, '1').replace(/\$\{episode\}/g, '1');
    return {
        embedUrl,
        provider: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$common$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getServerLabel"])(providerUrl)
    };
}
const __TURBOPACK__default__export__ = {
    getTVEmbed
};
}),
"[project]/components/players/TvPlayer.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>TvPlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/video-tv.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function TvPlayer({ mediaId, title, onClose }) {
    const [embedUrl, setEmbedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // ✅ INSTANT: No async calls, no validation delays
        const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$video$2d$tv$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTVEmbed"])(mediaId);
        setEmbedUrl(result.embedUrl);
        setLoading(false);
        console.log(`TV embed: ${result.embedUrl}`);
    }, [
        mediaId
    ]);
    const handleClose = ()=>onClose ? onClose() : router.back();
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "fixed inset-0 z-50 bg-black flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white",
                children: "Loading..."
            }, void 0, false, {
                fileName: "[project]/components/players/TvPlayer.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/players/TvPlayer.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
                src: embedUrl,
                className: "w-full h-full",
                allowFullScreen: true,
                allow: "autoplay; encrypted-media; picture-in-picture",
                style: {
                    border: 'none'
                }
            }, void 0, false, {
                fileName: "[project]/components/players/TvPlayer.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-4 left-4 z-30 flex items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: handleClose,
                        className: "p-2 rounded-full bg-black/60 text-white hover:bg-black/80",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            className: "w-6 h-6"
                        }, void 0, false, {
                            fileName: "[project]/components/players/TvPlayer.tsx",
                            lineNumber: 54,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/players/TvPlayer.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this),
                    title && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-white font-bold text-lg",
                        children: title
                    }, void 0, false, {
                        fileName: "[project]/components/players/TvPlayer.tsx",
                        lineNumber: 57,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/players/TvPlayer.tsx",
                lineNumber: 49,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/players/TvPlayer.tsx",
        lineNumber: 40,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$MoviePlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/players/MoviePlayer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$TvPlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/players/TvPlayer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api/tmdb.ts [app-ssr] (ecmascript)");
'use client';
;
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
    const id = parseInt(params?.id, 10);
    // Get season and episode from query params for TV shows (default to 1)
    const season = parseInt(searchParams.get('season') || '1', 10);
    const episode = parseInt(searchParams.get('episode') || '1', 10);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Hide body scroll for fullscreen experience
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return ()=>{
            document.body.style.overflow = prevOverflow || 'auto';
        };
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        let cancelled = false;
        async function loadMediaData() {
            setLoading(true);
            try {
                let data = null;
                if (mediaType === 'movie') {
                    data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tmdbApi"].getMovieDetails(id);
                } else if (mediaType === 'tv') {
                    data = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2f$tmdb$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["tmdbApi"].getTVShowDetails(id);
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
        return ()=>{
            cancelled = true;
        };
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
                        lineNumber: 73,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                        lineNumber: 84,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
    // Determine a display title (movie.title or tv.name)
    const title = mediaData?.title ?? mediaData?.name ?? '';
    // Render correct player
    if (mediaType === 'movie') {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$MoviePlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$players$2f$TvPlayer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black flex items-center justify-center text-white",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    className: "text-xl font-semibold mb-4",
                    children: "Unsupported media type"
                }, void 0, false, {
                    fileName: "[project]/app/watch/[mediatype]/[id]/page.tsx",
                    lineNumber: 133,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-ssr] (ecmascript)");
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
const ArrowLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])("arrow-left", __iconNode);
;
 //# sourceMappingURL=arrow-left.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "ArrowLeft": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript)");
}),

};

//# sourceMappingURL=_2ea3f24c._.js.map