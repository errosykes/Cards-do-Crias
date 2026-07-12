import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { Card } from '../types';

const globalCardCache = new Map<string, Card>();
let hasLoadedAllCards = false;
let loadPromise: Promise<void> | null = null;

const CACHE_KEY = 'v1_cards_cache';
const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const loadAllCards = async (force: boolean = false): Promise<void> => {
  if (force) {
    globalCardCache.clear();
    localStorage.removeItem(CACHE_KEY);
    hasLoadedAllCards = false;
    loadPromise = null;
  }

  if (hasLoadedAllCards && !force) return;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    let usedCache = false;
    try {
      if (!force) {
        const cachedStr = localStorage.getItem(CACHE_KEY);
        if (cachedStr) {
           const parsed = JSON.parse(cachedStr);
           if (Date.now() - parsed.timestamp < CACHE_TIME) {
              const cards = parsed.cards as Card[];
              cards.forEach(c => globalCardCache.set(c.id, c));
              hasLoadedAllCards = true;
              usedCache = true;
              return;
           }
        }
      }

      const snap = await getDocs(collection(db, 'cards'));
      const cardsToCache: Card[] = [];
      snap.docs.forEach(d => {
        const card = { id: d.id, ...d.data() } as Card;
        globalCardCache.set(d.id, card);
        cardsToCache.push(card);
      });
      
      localStorage.setItem(CACHE_KEY, JSON.stringify({
         timestamp: Date.now(),
         cards: cardsToCache
      }));

      hasLoadedAllCards = true;
    } catch (err: any) {
      console.error("Failed to load cards cache, falling back to expired cache if available", err);
      const cachedStr = localStorage.getItem(CACHE_KEY);
      if (cachedStr && !usedCache) {
         const parsed = JSON.parse(cachedStr);
         const cards = parsed.cards as Card[];
         cards.forEach(c => globalCardCache.set(c.id, c));
         hasLoadedAllCards = true;
         console.log("Loaded expired cache due to Firestore error.");
      } else {
         throw err;
      }
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
