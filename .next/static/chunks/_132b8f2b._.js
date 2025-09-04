(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/components/player/VideoPlayer.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": ()=>VideoPlayer
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-client] (ecmascript) <export default as ArrowLeft>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function VideoPlayer(param) {
    let { mediaId, mediaType, season, episode, onClose } = param;
    var _seasonData_episodes, _sources_currentSourceIndex;
    _s();
    const [embedUrl, setEmbedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [sources, setSources] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [currentSourceIndex, setCurrentSourceIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isTesting, setIsTesting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [iframeKey, setIframeKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Episode tracking state
    const [currentSeason, setCurrentSeason] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(season);
    const [currentEpisode, setCurrentEpisode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(episode);
    const [showTitle, setShowTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // TMDB metadata for auto-advance
    const [seasonData, setSeasonData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [totalSeasons, setTotalSeasons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const iframeRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const testTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const mutationObserverRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const autoAdvanceTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    // Extract season/episode from URL params
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            if (mediaType === 'tv') {
                const urlSeason = searchParams.get('season');
                const urlEpisode = searchParams.get('episode');
                if (urlSeason && urlEpisode) {
                    const newSeason = parseInt(urlSeason);
                    const newEpisode = parseInt(urlEpisode);
                    if (newSeason !== currentSeason || newEpisode !== currentEpisode) {
                        setCurrentSeason(newSeason);
                        setCurrentEpisode(newEpisode);
                    }
                }
            }
        }
    }["VideoPlayer.useEffect"], [
        searchParams,
        mediaType,
        currentSeason,
        currentEpisode
    ]);
    // Fetch TMDB episode metadata for auto-advance
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            const fetchEpisodeMetadata = {
                "VideoPlayer.useEffect.fetchEpisodeMetadata": async ()=>{
                    var _process_env_NEXT_PUBLIC_TMDB_API_KEY;
                    if (mediaType !== 'tv' || !currentSeason) return;
                    const API_KEY = (_process_env_NEXT_PUBLIC_TMDB_API_KEY = ("TURBOPACK compile-time value", "21cd0c00d578f346fd8a0ffefb679e24")) === null || _process_env_NEXT_PUBLIC_TMDB_API_KEY === void 0 ? void 0 : _process_env_NEXT_PUBLIC_TMDB_API_KEY.trim();
                    if (!API_KEY) return;
                    try {
                        // Get show details for total seasons
                        const showResponse = await fetch("https://api.themoviedb.org/3/tv/".concat(mediaId, "?api_key=").concat(API_KEY));
                        if (showResponse.ok) {
                            const showData = await showResponse.json();
                            setTotalSeasons(showData.number_of_seasons || 1);
                            setShowTitle(showData.name || 'Unknown Show');
                        }
                        // Get season details with episodes
                        const seasonResponse = await fetch("https://api.themoviedb.org/3/tv/".concat(mediaId, "/season/").concat(currentSeason, "?api_key=").concat(API_KEY));
                        if (seasonResponse.ok) {
                            var _data_episodes;
                            const data = await seasonResponse.json();
                            setSeasonData(data);
                            console.log("📺 Loaded season ".concat(currentSeason, " metadata:"), (_data_episodes = data.episodes) === null || _data_episodes === void 0 ? void 0 : _data_episodes.length, 'episodes');
                        }
                    } catch (error) {
                        console.warn('Failed to fetch episode metadata:', error);
                    }
                }
            }["VideoPlayer.useEffect.fetchEpisodeMetadata"];
            fetchEpisodeMetadata();
        }
    }["VideoPlayer.useEffect"], [
        mediaId,
        mediaType,
        currentSeason
    ]);
    // Auto-advance timer based on episode runtime
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            var _seasonData_episodes;
            if (mediaType !== 'tv' || !currentEpisode || !currentSeason) return;
            // Clear existing timer
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
            }
            // Get episode runtime from TMDB data
            const currentEpisodeData = seasonData === null || seasonData === void 0 ? void 0 : (_seasonData_episodes = seasonData.episodes) === null || _seasonData_episodes === void 0 ? void 0 : _seasonData_episodes.find({
                "VideoPlayer.useEffect": (ep)=>ep.episode_number === currentEpisode
            }["VideoPlayer.useEffect"]);
            const episodeRuntime = (currentEpisodeData === null || currentEpisodeData === void 0 ? void 0 : currentEpisodeData.runtime) || 45; // Default 45 minutes
            const runtimeMs = episodeRuntime * 60 * 1000; // Convert to milliseconds
            console.log("⏱️ Setting auto-advance timer for ".concat(episodeRuntime, " minutes"));
            autoAdvanceTimerRef.current = setTimeout({
                "VideoPlayer.useEffect": ()=>{
                    handleAutoAdvance();
                }
            }["VideoPlayer.useEffect"], runtimeMs);
            return ({
                "VideoPlayer.useEffect": ()=>{
                    if (autoAdvanceTimerRef.current) {
                        clearTimeout(autoAdvanceTimerRef.current);
                    }
                }
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], [
        currentEpisode,
        currentSeason,
        seasonData,
        mediaId
    ]);
    // Handle auto-advance to next episode
    const handleAutoAdvance = async ()=>{
        if (!currentEpisode || !currentSeason) return;
        let nextEpisode = currentEpisode + 1;
        let nextSeason = currentSeason;
        // Check if we need to advance to next season
        const episodeCount = (seasonData === null || seasonData === void 0 ? void 0 : seasonData.episode_count) || 20; // Default estimate
        if (nextEpisode > episodeCount) {
            nextEpisode = 1;
            nextSeason = currentSeason + 1;
            // Check if series is complete
            if (nextSeason > totalSeasons) {
                console.log('🎬 Series complete - no more episodes');
                return;
            }
        }
        console.log("🎬 Auto-advancing: S".concat(currentSeason, "E").concat(currentEpisode, " → S").concat(nextSeason, "E").concat(nextEpisode));
        // Update state
        setCurrentSeason(nextSeason);
        setCurrentEpisode(nextEpisode);
        // Update URL
        router.replace("/watch/tv/".concat(mediaId, "?season=").concat(nextSeason, "&episode=").concat(nextEpisode), {
            scroll: false
        });
        // Force iframe reload with new episode
        setIframeKey((prev)=>prev + 1);
    };
    // MutationObserver to watch iframe src changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            if (!iframeRef.current || mediaType !== 'tv') return;
            const iframe = iframeRef.current;
            mutationObserverRef.current = new MutationObserver({
                "VideoPlayer.useEffect": (mutations)=>{
                    mutations.forEach({
                        "VideoPlayer.useEffect": (mutation)=>{
                            if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
                                const newSrc = iframe.src;
                                handleIframeSrcChange(newSrc);
                            }
                        }
                    }["VideoPlayer.useEffect"]);
                }
            }["VideoPlayer.useEffect"]);
            mutationObserverRef.current.observe(iframe, {
                attributes: true,
                attributeFilter: [
                    'src'
                ]
            });
            return ({
                "VideoPlayer.useEffect": ()=>{
                    if (mutationObserverRef.current) {
                        mutationObserverRef.current.disconnect();
                    }
                }
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], [
        embedUrl,
        mediaType
    ]);
    // Handle iframe src changes from auto-play
    const handleIframeSrcChange = (newSrc)=>{
        if (!newSrc || mediaType !== 'tv') return;
        const { season: newSeason, episode: newEpisode } = parseSeasonEpisodeFromUrl(newSrc);
        if (newSeason && newEpisode && (newSeason !== currentSeason || newEpisode !== currentEpisode)) {
            console.log("🎬 Provider URL change detected: S".concat(newSeason, "E").concat(newEpisode));
            // Reset auto-advance timer since provider is handling navigation
            if (autoAdvanceTimerRef.current) {
                clearTimeout(autoAdvanceTimerRef.current);
            }
            setCurrentSeason(newSeason);
            setCurrentEpisode(newEpisode);
            const newUrl = "/watch/tv/".concat(mediaId, "?season=").concat(newSeason, "&episode=").concat(newEpisode);
            router.replace(newUrl, {
                scroll: false
            });
        }
    };
    // Test a source with timeout
    const testSource = function(url) {
        let timeout = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 8000;
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
    // Update metadata from source
    const updateMetadataFromSource = (source)=>{
        if (source.season && source.episode) {
            setCurrentSeason(source.season);
            setCurrentEpisode(source.episode);
        }
        if (source.title) {
            setShowTitle(source.title);
        }
    };
    // Find first working source
    const findWorkingSource = async (videoSources)=>{
        setIsTesting(true);
        for(let i = 0; i < videoSources.length; i++){
            console.log("Testing source ".concat(i + 1, "/").concat(videoSources.length, ": ").concat(videoSources[i].servers));
            const isWorking = await testSource(videoSources[i].url);
            if (isWorking) {
                console.log("✓ Source ".concat(i + 1, " working: ").concat(videoSources[i].servers));
                updateMetadataFromSource(videoSources[i]);
                setIsTesting(false);
                return i;
            } else {
                console.log("✗ Source ".concat(i + 1, " failed: ").concat(videoSources[i].servers));
            }
        }
        setIsTesting(false);
        return null;
    };
    // Load and test sources
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            let cancelled = false;
            const loadSources = {
                "VideoPlayer.useEffect.loadSources": async ()=>{
                    setLoading(true);
                    setError(null);
                    setEmbedUrl('');
                    try {
                        // Load sources from API
                        const videoSources = mediaType === 'movie' ? await videoApi.getMovieSources(mediaId) : await videoApi.getTVSources(mediaId, currentSeason || 1, currentEpisode || 1);
                        if (cancelled) return;
                        if (videoSources.length === 0) {
                            setError('No video sources available');
                            setLoading(false);
                            return;
                        }
                        setSources(videoSources);
                        // Update metadata from first source
                        if (videoSources[0]) {
                            updateMetadataFromSource(videoSources[0]);
                        }
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
                                    season: currentSeason || 1,
                                    episode: currentEpisode || 1
                                })
                            });
                            if (response.ok) {
                                const data = await response.json();
                                if (data.success && data.workingUrl) {
                                    const workingIndex = videoSources.findIndex({
                                        "VideoPlayer.useEffect.loadSources.workingIndex": (s)=>s.url === data.workingUrl
                                    }["VideoPlayer.useEffect.loadSources.workingIndex"]);
                                    if (workingIndex !== -1) {
                                        setCurrentSourceIndex(workingIndex);
                                        setEmbedUrl(data.workingUrl);
                                        setIframeKey({
                                            "VideoPlayer.useEffect.loadSources": (prev)=>prev + 1
                                        }["VideoPlayer.useEffect.loadSources"]);
                                        updateMetadataFromSource(videoSources[workingIndex]);
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
                            setIframeKey({
                                "VideoPlayer.useEffect.loadSources": (prev)=>prev + 1
                            }["VideoPlayer.useEffect.loadSources"]);
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
                }
            }["VideoPlayer.useEffect.loadSources"];
            if (mediaType === 'tv' && currentSeason && currentEpisode) {
                loadSources();
            } else if (mediaType === 'movie') {
                loadSources();
            }
            return ({
                "VideoPlayer.useEffect": ()=>{
                    cancelled = true;
                    if (testTimeoutRef.current) {
                        clearTimeout(testTimeoutRef.current);
                    }
                }
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], [
        mediaId,
        mediaType,
        currentSeason,
        currentEpisode
    ]);
    // Handle iframe error - try next source
    const handleIframeError = async ()=>{
        var _sources_currentSourceIndex;
        console.warn("Iframe error on source: ".concat((_sources_currentSourceIndex = sources[currentSourceIndex]) === null || _sources_currentSourceIndex === void 0 ? void 0 : _sources_currentSourceIndex.servers));
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
                const newSource = sources[absoluteIndex];
                console.log("Switching to source ".concat(absoluteIndex + 1, ": ").concat(newSource.servers));
                setCurrentSourceIndex(absoluteIndex);
                setEmbedUrl(newSource.url);
                setIframeKey((prev)=>prev + 1);
                setError(null);
                updateMetadataFromSource(newSource);
                return;
            }
        }
        setError('All video sources failed to load');
    };
    // Handle successful load
    const handleIframeLoad = ()=>{
        var _sources_currentSourceIndex, _iframeRef_current;
        console.log("✓ Successfully loaded: ".concat((_sources_currentSourceIndex = sources[currentSourceIndex]) === null || _sources_currentSourceIndex === void 0 ? void 0 : _sources_currentSourceIndex.servers));
        setError(null);
        // Auto-detect episode changes on iframe load
        if (mediaType === 'tv' && ((_iframeRef_current = iframeRef.current) === null || _iframeRef_current === void 0 ? void 0 : _iframeRef_current.src)) {
            const { season: newSeason, episode: newEpisode } = parseSeasonEpisodeFromUrl(iframeRef.current.src);
            if (newSeason && newEpisode && (newSeason !== currentSeason || newEpisode !== currentEpisode)) {
                console.log("🎬 Auto-detected via iframe load: S".concat(newSeason, "E").concat(newEpisode));
                setCurrentSeason(newSeason);
                setCurrentEpisode(newEpisode);
                router.replace("/watch/tv/".concat(mediaId, "?season=").concat(newSeason, "&episode=").concat(newEpisode), {
                    scroll: false
                });
            }
        }
    };
    // Handle close
    const handleClose = ()=>{
        // Clean up timers
        if (autoAdvanceTimerRef.current) {
            clearTimeout(autoAdvanceTimerRef.current);
        }
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };
    // Handle ESC key
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "VideoPlayer.useEffect": ()=>{
            const handleKeyDown = {
                "VideoPlayer.useEffect.handleKeyDown": (e)=>{
                    if (e.key === 'Escape') {
                        handleClose();
                    }
                }
            }["VideoPlayer.useEffect.handleKeyDown"];
            document.addEventListener('keydown', handleKeyDown);
            return ({
                "VideoPlayer.useEffect": ()=>document.removeEventListener('keydown', handleKeyDown)
            })["VideoPlayer.useEffect"];
        }
    }["VideoPlayer.useEffect"], []);
    // Get current episode info for display
    const currentEpisodeData = seasonData === null || seasonData === void 0 ? void 0 : (_seasonData_episodes = seasonData.episodes) === null || _seasonData_episodes === void 0 ? void 0 : _seasonData_episodes.find((ep)=>ep.episode_number === currentEpisode);
    const episodeRuntime = currentEpisodeData === null || currentEpisodeData === void 0 ? void 0 : currentEpisodeData.runtime;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-50 bg-black",
        children: [
            (loading || isTesting) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-white text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-6 mx-auto"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 481,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl mb-2",
                            children: isTesting ? 'Testing video sources...' : 'Loading video sources...'
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 482,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400",
                            children: "Finding the best server for you"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 485,
                            columnNumber: 13
                        }, this),
                        sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-gray-500 mt-2",
                            children: [
                                sources.length,
                                " sources available"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 489,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/player/VideoPlayer.tsx",
                    lineNumber: 480,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/player/VideoPlayer.tsx",
                lineNumber: 479,
                columnNumber: 9
            }, this),
            error && !loading && !isTesting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 flex items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-white text-center max-w-md px-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-6xl mb-6",
                            children: "⚠️"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 501,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold mb-4",
                            children: "Unable to Play Video"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 502,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-300 mb-4",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 503,
                            columnNumber: 13
                        }, this),
                        sources.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-400 mb-6",
                            children: [
                                "Tested ",
                                sources.length,
                                " different servers"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 505,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleClose,
                            className: "px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors",
                            children: "Go Back"
                        }, void 0, false, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 510,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/player/VideoPlayer.tsx",
                    lineNumber: 500,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/player/VideoPlayer.tsx",
                lineNumber: 499,
                columnNumber: 9
            }, this),
            embedUrl && !loading && !error && !isTesting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("iframe", {
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
                    }, iframeKey, false, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 523,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 left-4 z-30 flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: handleClose,
                                className: "p-2 rounded-full bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors",
                                "aria-label": "Back",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                    className: "w-6 h-6"
                                }, void 0, false, {
                                    fileName: "[project]/components/player/VideoPlayer.tsx",
                                    lineNumber: 542,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 537,
                                columnNumber: 13
                            }, this),
                            showTitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-white font-extrabold text-lg sm:text-xl truncate max-w-xs sm:max-w-md",
                                children: showTitle
                            }, void 0, false, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 546,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 536,
                        columnNumber: 11
                    }, this),
                    mediaType === 'tv' && currentSeason && currentEpisode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 left-1/2 transform -translate-x-1/2 z-30",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-black/60 backdrop-blur-sm text-white px-4 py-1 rounded-md shadow-lg",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-bold text-base sm:text-lg",
                                    children: [
                                        "S",
                                        currentSeason,
                                        "E",
                                        currentEpisode
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/player/VideoPlayer.tsx",
                                    lineNumber: 556,
                                    columnNumber: 17
                                }, this),
                                episodeRuntime && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs ml-2 opacity-75",
                                    children: [
                                        "(",
                                        episodeRuntime,
                                        "min)"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/player/VideoPlayer.tsx",
                                    lineNumber: 560,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/player/VideoPlayer.tsx",
                            lineNumber: 555,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 554,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-4 right-4 text-white/70 text-sm pointer-events-none",
                        children: [
                            mediaType === 'tv' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    "Auto-advance enabled (",
                                    episodeRuntime || 45,
                                    "min)"
                                ]
                            }, void 0, true) : 'Auto-switch enabled',
                            " — Press ESC to exit"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 569,
                        columnNumber: 11
                    }, this),
                    ("TURBOPACK compile-time value", "development") === 'development' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "font-mono",
                                children: [
                                    "Server: ",
                                    (_sources_currentSourceIndex = sources[currentSourceIndex]) === null || _sources_currentSourceIndex === void 0 ? void 0 : _sources_currentSourceIndex.servers
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 578,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-gray-300 mt-1",
                                children: [
                                    "Source ",
                                    currentSourceIndex + 1,
                                    " of ",
                                    sources.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/player/VideoPlayer.tsx",
                                lineNumber: 581,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/player/VideoPlayer.tsx",
                        lineNumber: 577,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true)
        ]
    }, void 0, true, {
        fileName: "[project]/components/player/VideoPlayer.tsx",
        lineNumber: 476,
        columnNumber: 5
    }, this);
}
_s(VideoPlayer, "y44NChiA71uGc6m2wLJgGMAZ7GI=", false, function() {
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

//# sourceMappingURL=_132b8f2b._.js.map