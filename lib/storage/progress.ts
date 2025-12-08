// lib/storage/progress.ts

export interface WatchHistoryItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  position: number;    // seconds
  duration?: number;   // seconds
  season?: number;
  episode?: number;
  lastWatched: number; // timestamp
}

const STORAGE_KEY = 'atto4_watch_history';
const MAX_ITEMS = 20;

export const progressStorage = {
  // Get all history sorted by lastWatched desc (newest first)
  getHistory: (): WatchHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const items: WatchHistoryItem[] = raw ? JSON.parse(raw) : [];
      return items.sort((a, b) => b.lastWatched - a.lastWatched);
    } catch {
      return [];
    }
  },

  // Save progress (Upsert)
  saveProgress: (item: Omit<WatchHistoryItem, 'lastWatched'>) => {
    if (typeof window === 'undefined') return;
    
    const history = progressStorage.getHistory();
    const now = Date.now();

    // 1. Filter out existing entry for this specific ID + MediaType (Deduping)
    const others = history.filter(i => !(i.id === item.id && i.mediaType === item.mediaType));

    // 2. Create updated item
    const newItem: WatchHistoryItem = {
      ...item,
      lastWatched: now,
    };

    // 3. Add to top & limit size
    const updated = [newItem, ...others].slice(0, MAX_ITEMS);
    
    // 4. Persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // 5. Emit event
    window.dispatchEvent(new CustomEvent('history-updated'));
  },

  // Remove specific item
  removeItem: (id: number, mediaType: 'movie' | 'tv') => {
    const history = progressStorage.getHistory();
    const updated = history.filter(i => !(i.id === id && i.mediaType === mediaType));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('history-updated'));
  }
};
