// lib/storage/progress.ts

interface WatchHistoryItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  lastWatched: number; // Timestamp
  season?: number;
  episode?: number;
}

const STORAGE_KEY = 'atto4_watch_history';

export const progressStorage = {
  // Get all history
  getHistory: (): WatchHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Add or Update Item
  saveProgress: (item: Omit<WatchHistoryItem, 'lastWatched'>) => {
    if (typeof window === 'undefined') return;
    
    const history = progressStorage.getHistory();
    const newItem = { ...item, lastWatched: Date.now() };
    
    // Remove existing entry for this ID to avoid duplicates
    const filtered = history.filter(i => i.id !== item.id);
    
    // Add to top
    const updated = [newItem, ...filtered].slice(0, 20); // Keep max 20 items
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('history-updated'));
  },

  // Clear specific item
  removeItem: (id: number) => {
    const history = progressStorage.getHistory();
    const updated = history.filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('history-updated'));
  }
};
