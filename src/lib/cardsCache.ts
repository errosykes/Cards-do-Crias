import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Card } from '../types';

const globalCardCache = new Map<string, Card>();
let hasLoadedAllCards = false;
let loadPromise: Promise<void> | null = null;

export const loadAllCards = async (): Promise<void> => {
  if (hasLoadedAllCards) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const snap = await getDocs(collection(db, 'cards'));
      snap.docs.forEach(d => {
        globalCardCache.set(d.id, { id: d.id, ...d.data() } as Card);
      });
      hasLoadedAllCards = true;
    } catch (err) {
      console.error("Failed to load cards cache", err);
      throw err;
    } finally {
      loadPromise = null;
    }
  })();
  return loadPromise;
};

export const getCachedCard = (id: string): Card | undefined => {
  return globalCardCache.get(id);
};

export const getAllCachedCards = (): Card[] => {
  return Array.from(globalCardCache.values());
};
