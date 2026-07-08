import React from 'react';
import { Card } from '../types';

interface Props {
  card: Card;
  onClose: () => void;
}

export function CardModal({ card, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 font-serif" onClick={onClose}>
      <div className="bg-[#1a1814] border-2 border-[#a67c52] rounded-md p-6 max-w-sm w-full shadow-2xl relative flex flex-col items-center gap-6" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-4 text-2xl text-[#a67c52] hover:text-[#e2b17a]">
          &times;
        </button>
        
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e2b17a] text-center w-full border-b border-[#3d3326] pb-2">
          {card.name}
        </h2>

        <div className="w-48 h-64 bg-[#3d3326] border-2 border-[#a67c52] rounded-md overflow-hidden relative shadow-lg">
          <div className="absolute left-2 top-2 w-8 h-8 bg-[#a67c52] rounded-full flex items-center justify-center text-sm font-bold text-black shadow-inner z-10 border border-black/50">
            {card.points}
          </div>
          <div className="absolute right-2 top-2 text-[10px] font-bold uppercase text-[#a67c52] bg-black/80 px-2 py-1 rounded border border-[#3d3326] z-10">
            {card.type}
          </div>
          {card.imageUrl ? (
            <img src={card.imageUrl} referrerPolicy="no-referrer" alt={card.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center border-4 border-[#3d3326]">
               <span className="font-bold uppercase text-[#a67c52] text-xl">{card.name}</span>
            </div>
          )}
        </div>
        
        <div className="w-full bg-[#0f0e0c] border border-[#3d3326] p-4 rounded text-center space-y-3">
          <p className="text-sm text-[#d4c3a1] italic">{card.description}</p>
          {card.effects && card.effects.length > 0 && (
            <div className="pt-2 border-t border-[#3d3326] flex flex-wrap justify-center gap-2">
              {card.effects.map((eff, i) => (
                <span key={i} className="bg-[#3d3326] text-xs font-bold text-[#e2b17a] uppercase px-2 py-1 rounded border border-[#a67c52]/50">
                  {eff}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
