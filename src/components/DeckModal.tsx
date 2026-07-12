import React, { useEffect, useState } from 'react';
import { Card } from '../types';
import { loadAllCards, getCachedCard } from '../lib/cardsCache';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CardModal } from './CardModal';
import { Eye, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface Props {
  deckIds: string[];
  onClose: () => void;
}

export function DeckModal({ deckIds, onClose }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    const fetchCards = async () => {
      await loadAllCards();
      const loaded: Card[] = deckIds.map(id => getCachedCard(id)).filter(Boolean) as Card[];
      // Group them and sort
      setCards(loaded);
      setLoading(false);
    };
    fetchCards();
  }, [deckIds]);

  const grouped = cards.reduce((acc, card) => {
    const existing = acc.find(c => c.card.id === card.id);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ card, count: 1 });
    }
    return acc;
  }, [] as { card: Card, count: number }[]);

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-[100] p-4 font-serif" onClick={onClose}>
      <div className="bg-[#1a1814] border border-[#3d3326] rounded-md p-6 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#3d3326] pb-4 mb-4">
           <h2 className="text-xl font-bold uppercase tracking-widest text-[#e2b17a]">
             Baralho Atual ({deckIds.length} Cartas)
           </h2>
           <button onClick={onClose} className="text-[#a67c52] hover:text-white p-2">
             <ArrowLeft className="w-5 h-5" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
           {loading ? (
              <div className="flex items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#a67c52]"></div>
              </div>
           ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                 {grouped.map(({card, count}) => (
                    <div key={card.id} className="relative flex flex-col transition-transform hover:scale-105">
                      <div className="relative cursor-pointer w-full group" onClick={() => setSelectedCard(card)}>
                        <div className="absolute top-1 left-1 bg-black text-[#d4c3a1] text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg border border-[#3d3326]">
                          x{count}
                        </div>
                        {card.imageUrl ? (
                          <img src={card.imageUrl} referrerPolicy="no-referrer" alt={card.name} className="w-full aspect-[2/3] object-contain rounded shadow-md border border-[#3d3326] bg-black/50" />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-[#3d3326] rounded border border-[#a67c52] flex flex-col items-center justify-center p-2 text-center">
                             <span className="text-xs font-bold uppercase">{card.name}</span>
                             <span className="text-xs text-[#a67c52] font-mono mt-1">{card.points} Pts</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-[#0f0e0c]/90 opacity-0 group-hover:opacity-100 transition-opacity rounded p-3 flex flex-col justify-center text-center border border-[#a67c52]">
                           <span className="text-xs font-bold text-[#e2b17a] mb-1 uppercase">{card.name}</span>
                           <Eye className="w-6 h-6 text-[#a67c52] mx-auto mt-2" />
                        </div>
                      </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>
      {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />}
    </div>
  );
}
