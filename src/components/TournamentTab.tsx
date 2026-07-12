import React, { useState, useEffect } from 'react';
import { Card, User } from '../types';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { loadAllCards, getAllCachedCards } from '../lib/cardsCache';
import { Play, Lock, CheckCircle2 } from 'lucide-react';

interface Props {
  userData: User;
  startSpecificBotMatch: (diff: string, customDeck: Card[], botName: string, botProfile?: any, campaignId?: string) => void;
  searching: boolean;
}

export function TournamentTab({ userData, startSpecificBotMatch, searching }: Props) {
  const [allCards, setAllCards] = useState<Card[]>([]);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCards = async () => {
       await loadAllCards();
       
       setAllCards(getAllCachedCards());
    };
    fetchCards();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
       const campSnap = await getDocs(collection(db, 'campaigns'));
       let fetchedCamps: any[] = campSnap.docs.map(d => ({ id: d.id, ...d.data() }));
       fetchedCamps.sort((a: any, b: any) => a.order - b.order);
       if (fetchedCamps.length === 0) {
           fetchedCamps = [{ id: 'tournament-1', title: '1º Torneio', type: 'tournament', description: 'Torneio Clássico', order: 1 }];
       }
       setCampaigns(fetchedCamps);

       const snap = await getDocs(collection(db, 'tournament_npcs'));
       if (snap.empty) {
         // create default ones
         const defaultNpcs = [
            { id: '1', campaignId: 'tournament-1', order: 1, name: 'O Pai de familia', diff: 'easy', desc: 'Deck focado em cartas básicas de combate corpo a corpo.' },
            { id: '2', campaignId: 'tournament-1', order: 2, name: 'Devedor de Pensão', diff: 'normal', desc: 'Usa cartas de longo alcance e algumas curas.' },
            { id: '3', campaignId: 'tournament-1', order: 3, name: 'Mordedor', diff: 'normal', desc: 'Agressivo, muitos espiões e dano alto.' },
            { id: '4', campaignId: 'tournament-1', order: 4, name: 'Quer X-Tudo', diff: 'hard', desc: 'Focado em heróis e climas fortes.' },
            { id: '5', campaignId: 'tournament-1', order: 5, name: 'Quer X-Bacon', diff: 'hard', desc: 'Abusa de vínculos estreitos e multiplicadores.' },
            { id: '6', campaignId: 'tournament-1', order: 6, name: 'O Batata', diff: 'expert', desc: 'O campeão invicto. Deck equilibrado e letal.' }
         ];
         for (const n of defaultNpcs) {
            await setDoc(doc(db, 'tournament_npcs', n.id), n);
         }
         setNpcs(defaultNpcs);
       } else {
         const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
         fetched.sort((a: any, b: any) => a.order - b.order);
         setNpcs(fetched);
       }
       setLoading(false);
    };
    fetchData();
  }, []);

  const buildDeckForNpc = (npc: any): Card[] => {
     let deck: Card[] = [];
     if (allCards.length === 0) return deck;
     
     if (npc.deck && npc.deck.length > 0) {
        npc.deck.forEach((cardId: string) => {
           const card = allCards.find(c => c.id === cardId);
           if (card) deck.push(card);
        });
        while (deck.length < 10) { deck.push(allCards[Math.floor(Math.random() * allCards.length)]); }
        return deck.slice(0, 10);
     }
     
     // basic filtering based on NPC flavor if no custom deck
     const npcId = npc.order;
     const melee = allCards.filter(c => c.type === 'Melee');
     const ranged = allCards.filter(c => c.type === 'Ranged');
     const heroes = allCards.filter(c => c.effects?.includes('Herói'));
     const spells = allCards.filter(c => c.type === 'Magic' || c.type === 'Heal' || c.type === 'Event' || c.type === 'Cenário');
     const spies = allCards.filter(c => c.effects?.includes('Espião'));

     if (npcId === 1) {
        deck = [...melee.slice(0, 15), ...spells.slice(0, 5)];
     } else if (npcId === 2) {
        deck = [...ranged.slice(0, 15), ...spells.filter(c=>c.type === 'Heal').slice(0,5)];
     } else if (npcId === 3) {
        deck = [...melee.slice(0, 10), ...ranged.slice(0,5), ...spies.slice(0, 5)];
     } else if (npcId === 4) {
        deck = [...heroes.slice(0, 10), ...spells.filter(c=>c.type==='Cenário').slice(0, 10)];
     } else if (npcId === 5) {
        const bondCards = allCards.filter(c => c.effects?.includes('Vínculo Estreito'));
        deck = [...bondCards.slice(0, 15), ...spells.slice(0,5)];
     } else {
        deck = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 25);
     }
     
     while (deck.length < 10) {
        deck.push(allCards[Math.floor(Math.random() * allCards.length)]);
     }
     return deck.slice(0, 10);
  };

  const handleStart = (npc: any) => {
      const deck = buildDeckForNpc(npc);
      startSpecificBotMatch(npc.diff, deck, npc.name, { avatarUrl: npc.imageUrl, coverUrl: npc.backgroundUrl }, npc.campaignId || 'tournament-1');
  };

  const currentProgress = userData.tournamentProgress || 1;

  if (loading) return <div className="text-[#d4c3a1]">Carregando Torneio...</div>;

  return (
    <div className="flex flex-col h-full bg-[#141210] p-4 md:p-8 overflow-y-auto space-y-12">
      {campaigns.map(camp => {
         const campNpcs = npcs.filter(n => (n.campaignId || 'tournament-1') === camp.id).sort((a, b) => a.order - b.order);
         
         if (campNpcs.length === 0) return null;

         return (
           <div key={camp.id}>
             <div className="mb-4 border-b border-[#3d3326] pb-2">
                <h2 className="text-2xl font-bold tracking-tighter text-[#a67c52] uppercase mb-1">
                  [{camp.type === 'event' ? 'Evento' : camp.type === 'mission' ? 'Missão' : 'Torneio'}] {camp.title}
                </h2>
                <p className="text-[#d4c3a1]/60 text-[10px] tracking-widest uppercase">{camp.description}</p>
             </div>
             
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
               {campNpcs.map((npc, idx) => {
                  const isUnlocked = camp.type !== 'tournament' || npc.order <= currentProgress;
                  const isCompleted = camp.type === 'tournament' && npc.order < currentProgress;
                  const isCurrent = camp.type === 'tournament' && npc.order === currentProgress;
                  
                  return (
                    <div key={npc.id} className={`border p-4 rounded flex flex-col relative overflow-hidden transition-all duration-300 ${isUnlocked ? 'border-[#a67c52] bg-black/60 shadow-[0_0_15px_rgba(166,124,82,0.1)]' : 'border-[#3d3326] bg-black/30 opacity-50'}`}>
                       {isCompleted && (
                          <div className="absolute top-2 right-2 text-green-500 bg-green-500/10 p-1 rounded-full border border-green-500/30">
                             <CheckCircle2 className="w-4 h-4" />
                          </div>
                       )}
                       
                       {npc.imageUrl && (
                          <img src={npc.imageUrl} alt={npc.name} className="w-16 h-16 object-cover rounded-full border-2 border-[#a67c52] mb-3 self-center shadow-lg" />
                       )}
                       <h3 className="font-bold text-[#e2b17a] uppercase mb-1 text-center">{npc.name}</h3>
                       <div className="flex items-center justify-center gap-2 mb-3">
                          <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold border ${
                             npc.diff === 'easy' ? 'bg-green-900/40 text-green-400 border-green-500/30' :
                             npc.diff === 'normal' ? 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30' :
                             npc.diff === 'hard' ? 'bg-red-900/40 text-red-400 border-red-500/30' :
                             'bg-purple-900/40 text-purple-400 border-purple-500/30'
                          }`}>
                            {npc.diff === 'easy' ? 'Fácil' : npc.diff === 'normal' ? 'Médio' : npc.diff === 'hard' ? 'Difícil' : 'Mestre'}
                          </span>
                       </div>
                       
                       <p className="text-[11px] text-[#d4c3a1]/80 mb-4 flex-1 text-center">{npc.desc}</p>
                       
                       {isUnlocked ? (
                          <button
                            onClick={() => handleStart(npc)}
                            disabled={searching}
                            className={`w-full py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
                               isCurrent 
                                 ? 'bg-gradient-to-r from-red-900 to-[#a67c52] hover:from-red-800 hover:to-[#e2b17a] text-white shadow-[0_0_15px_rgba(166,124,82,0.4)] animate-pulse'
                                 : 'bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-black'
                            }`}
                          >
                             <Play className="w-4 h-4" />
                             {searching ? 'Preparando...' : isCurrent ? 'Desafiar' : 'Jogar'}
                          </button>
                       ) : (
                          <button disabled className="w-full py-2 bg-black/40 border border-[#3d3326] text-[#d4c3a1]/30 rounded text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-not-allowed">
                             <Lock className="w-4 h-4" />
                             Bloqueado
                          </button>
                       )}
                    </div>
                  );
               })}
             </div>
           </div>
         );
      })}
    </div>
  );
}
