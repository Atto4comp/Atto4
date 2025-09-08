'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getMovieSources, getTVSources } from '@/lib/api/video-common';

type MediaType = 'movie' | 'tv';

type ServerResult =
  | string
  | { url: string; working?: boolean; responseTimeMs?: number; status?: number; probe?: 'HEAD'|'GET' };

interface UseEmbedAutoSwitchArgs {
  mediaType: MediaType;
  mediaId: number;
  season?: number;
  episode?: number;
  guardMs?: number;          // iframe load guard (auto switch) — default 6000
  preferServer?: boolean;    // use /api/check-embed first — default true
}

export function useEmbedAutoSwitch({
  mediaType,
  mediaId,
  season,
  episode,
  guardMs = 6000,
  preferServer = true,
}: UseEmbedAutoSwitchArgs) {
  const [candidates, setCandidates] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [src, setSrc] = useState<string>('');
  const failed = useRef<Set<number>>(new Set());
  const timer = useRef<number | null>(null);
  const attemptId = useRef(0);
  const mounted = useRef(true);

  const clearGuard = useCallback(() => {
    if (timer.current != null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const startGuard = useCallback((i: number) => {
    clearGuard();
    const thisAttempt = ++attemptId.current;
    timer.current = window.setTimeout(() => {
      // if still same attempt and not loaded — mark failed & next
      if (attemptId.current === thisAttempt) {
        failed.current.add(i);
        // try next
        let next = -1;
        for (let step = 1; step <= candidates.length; step++) {
          const cand = (i + step) % candidates.length;
          if (!failed.current.has(cand)) { next = cand; break; }
        }
        if (next >= 0) {
          setIndex(next);
          setSrc(candidates[next]);
          startGuard(next);
        }
      }
    }, guardMs) as unknown as number;
  }, [candidates, guardMs, clearGuard]);

  // load candidate list
  useEffect(() => {
    mounted.current = true;
    failed.current.clear();
    setCandidates([]);
    setIndex(0);
    setSrc('');

    (async () => {
      let list: string[] = [];

      // 1) server-probed list
      if (preferServer) {
        try {
          const res = await fetch('/api/check-embed', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mediaType,
              tmdbId: mediaId,
              season: season || 1,
              episode: episode || 1,
              timeoutMs: 4000,
              retries: 0,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // Accept either plain string array or array of objects
            const urls: ServerResult[] = Array.isArray(data.urls) ? data.urls : [];
            const normalized = urls.map(u => (typeof u === 'string' ? u : u?.url)).filter(Boolean) as string[];
            // Put workingUrl first if present and not already at front
            const first = typeof data.workingUrl === 'string' ? data.workingUrl : (data.workingUrl?.url ?? null);
            if (first) {
              list = [first, ...normalized.filter(u => u !== first)];
            } else {
              list = normalized;
            }
          }
        } catch {
          // ignore; fallback below
        }
      }

      // 2) fallback to local providers if needed
      if (list.length === 0) {
        const fallback = mediaType === 'movie'
          ? await getMovieSources(mediaId)
          : await getTVSources(mediaId, season || 1, episode || 1);
        list = (fallback || []).map(s => s.url).filter(Boolean);
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

    return () => {
      mounted.current = false;
      clearGuard();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId, mediaType, season, episode, preferServer, guardMs]);

  const onLoad = useCallback(() => {
    clearGuard();
    // current index succeeded; clear failure flag
    failed.current.delete(index);
  }, [index, clearGuard]);

  const onError = useCallback(() => {
    clearGuard();
    failed.current.add(index);
    // pick next
    let next = -1;
    for (let step = 1; step <= candidates.length; step++) {
      const cand = (index + step) % candidates.length;
      if (!failed.current.has(cand)) { next = cand; break; }
    }
    if (next >= 0) {
      setIndex(next);
      setSrc(candidates[next]);
      startGuard(next);
    }
  }, [index, candidates, clearGuard, startGuard]);

  // optional manual controls
  const next = useCallback(() => {
    clearGuard();
    let nextIdx = -1;
    for (let step = 1; step <= candidates.length; step++) {
      const cand = (index + step) % candidates.length;
      if (!failed.current.has(cand)) { nextIdx = cand; break; }
    }
    if (nextIdx >= 0) {
      setIndex(nextIdx);
      setSrc(candidates[nextIdx]);
      startGuard(nextIdx);
    }
  }, [index, candidates, clearGuard, startGuard]);

  const prev = useCallback(() => {
    clearGuard();
    let prevIdx = -1;
    for (let step = 1; step <= candidates.length; step++) {
      const cand = (index - step + candidates.length) % candidates.length;
      if (!failed.current.has(cand)) { prevIdx = cand; break; }
    }
    if (prevIdx >= 0) {
      setIndex(prevIdx);
      setSrc(candidates[prevIdx]);
      startGuard(prevIdx);
    }
  }, [index, candidates, clearGuard, startGuard]);

  return {
    src,
    index,
    total: candidates.length,
    onLoad,
    onError,
    next,
    prev,
    setIndex, // if you want to jump
  };
}
