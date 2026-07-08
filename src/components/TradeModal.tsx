import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logActivity } from '../lib/activity';
import { loadAllCards, getCachedCard } from '../lib/cardsCache';
import { User, Card } from '../types';

interface Props {
  tradeId: string;
  userData: User;
  onClose: () => void;
}

export function TradeModal({ tradeId, userData, onClose }: Props) {
  const [tradeData, setTradeData] = useState<any>(null);
  const [myInventory, setMyInventory] = useState<Card[]>([]);
  const [opponentCard, setOpponentCard] = useState<Card | null>(null);
  const [mySelectedCard, setMySelectedCard] = useState<Card | null>(null);

  useEffect(() => {
    // We are keeping it simple by not using onSnapshot here just to avoid complexity,
    // wait, we need real-time for trades to work properly.
    // Let's use onSnapshot.
    import('firebase/firestore').then(({ onSnapshot }) => {
      const unsub = onSnapshot(doc(db, 'trades', tradeId), async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTradeData(data);
          
          const isP1 = data.p1.uid === userData.uid;
          const me = isP1 ? data.p1 : data.p2;
          const opp = isP1 ? data.p2 : data.p1;

          if (opp.cardId) {
            await loadAllCards();
            const c = getCachedCard(opp.cardId);
            if (c) setOpponentCard(c);
          } else {
            setOpponentCard(null);
          }

          if (me.cardId) {
            await loadAllCards();
            const c = getCachedCard(me.cardId);
            if (c) setMySelectedCard(c);
          } else {
            setMySelectedCard(null);
          }
          
          if (data.status === 'completed') {
             alert('Troca concluída com sucesso!');
             onClose();
          }
        } else {
          onClose(); // deleted
        }
      });
      return () => unsub();
    });
  }, [tradeId, userData.uid, onClose]);

  useEffect(() => {
    const fetchInventory = async () => {
      if (!userData.inventory || userData.inventory.length === 0) return;
      // Fetch cards
      await loadAllCards();
      const uniqueIds = Array.from(new Set(userData.inventory));
      const cards: Card[] = uniqueIds.map(id => getCachedCard(id)).filter(Boolean) as Card[];
      setMyInventory(cards);
    };
    fetchInventory();
  }, [userData.inventory]);

  if (!tradeData) return null;

  const isP1 = tradeData.p1.uid === userData.uid;
  const me = isP1 ? tradeData.p1 : tradeData.p2;
  const opp = isP1 ? tradeData.p2 : tradeData.p1;

  const handleSelectCard = async (cardId: string) => {
    if (me.agreed) return; // Cannot change if agreed
    await updateDoc(doc(db, 'trades', tradeId), {
      [isP1 ? 'p1.cardId' : 'p2.cardId']: cardId
    });
  };

  const handleReady = async () => {
    if (!me.cardId) return;
    const isNowAgreed = !me.agreed;
    const oppWillBeAgreed = opp.agreed;
    
    if (isNowAgreed && oppWillBeAgreed) {
       // Both agreed! Execute trade.
       try {
         // Get both users latest inventory
         const u1Snap = await getDoc(doc(db, 'users', tradeData.p1.uid));
         const u2Snap = await getDoc(doc(db, 'users', tradeData.p2.uid));
         
         if (u1Snap.exists() && u2Snap.exists()) {
           const u1Data = u1Snap.data() as User;
           const u2Data = u2Snap.data() as User;
           
           const u1Inv = [...(u1Data.inventory || [])];
           const u2Inv = [...(u2Data.inventory || [])];
           
           // Remove card from U1
           const u1CardIdx = u1Inv.indexOf(tradeData.p1.cardId!);
           if (u1CardIdx > -1) u1Inv.splice(u1CardIdx, 1);
           
           // Remove card from U2
           const u2CardIdx = u2Inv.indexOf(tradeData.p2.cardId!);
           if (u2CardIdx > -1) u2Inv.splice(u2CardIdx, 1);
           
           // Swap
           u1Inv.push(tradeData.p2.cardId!);
           u2Inv.push(tradeData.p1.cardId!);
           
           // Save
           await updateDoc(doc(db, 'users', tradeData.p1.uid), { inventory: u1Inv });
           await updateDoc(doc(db, 'users', tradeData.p2.uid), { inventory: u2Inv });
           
           // Complete trade
           await updateDoc(doc(db, 'trades', tradeId), {
             status: 'completed',
             'p1.agreed': true,
             'p2.agreed': true
           });
           
           await logActivity(
             userData.uid, 
             userData.username, 
             'trade', 
             `Concluiu troca com ${isP1 ? tradeData.p2.username : tradeData.p1.username}`
           );
         }
       } catch (e) {
         console.error('Trade error', e);
         alert('Erro ao concluir a troca.');
       }
    } else {
       await updateDoc(doc(db, 'trades', tradeId), {
         [isP1 ? 'p1.agreed' : 'p2.agreed']: isNowAgreed
       });
    }
  };

  const handleCancel = async () => {
    await deleteDoc(doc(db, 'trades', tradeId));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 font-serif">
      <div className="bg-[#1a1814] border-2 border-[#3d3326] p-6 rounded-md w-full max-w-4xl text-[#d4c3a1] shadow-2xl relative flex flex-col h-[80vh]">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e2b17a] mb-6 text-center border-b border-[#3d3326] pb-2">
          Troca de Cartas
        </h2>
        
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* My Side */}
          <div className="flex-1 flex flex-col border border-[#3d3326] rounded p-4 bg-[#0f0e0c]">
             <h3 className="text-sm font-bold uppercase text-[#a67c52] mb-4 text-center">Você ({me.username})</h3>
             
             <div className="flex-1 overflow-y-auto mb-4 border border-[#3d3326] p-2 bg-black/50 rounded">
                <div className="grid grid-cols-3 gap-2">
                  {myInventory.map(card => (
                     <div 
                       key={card.id} 
                       onClick={() => handleSelectCard(card.id)}
                       className={`cursor-pointer border-2 rounded ${me.cardId === card.id ? 'border-[#a67c52]' : 'border-[#3d3326] hover:border-[#e2b17a]/50'}`}
                     >
                        <div className="w-full aspect-[2/3] bg-[#1a1814] relative">
                          {card.imageUrl ? (
                            <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                              <span className="text-[10px] font-bold uppercase text-[#a67c52] leading-tight">{card.name}</span>
                            </div>
                          )}
                          <div className="absolute top-1 left-1 bg-[#a67c52] text-black text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                            {card.points}
                          </div>
                        </div>
                     </div>
                  ))}
                </div>
             </div>
             
             <div className="flex flex-col items-center border-t border-[#3d3326] pt-4">
                <span className="text-xs uppercase text-[#d4c3a1]/60 mb-2">Sua Oferta</span>
                {mySelectedCard ? (
                  <div className="text-[#e2b17a] font-bold uppercase text-sm border border-[#a67c52] px-4 py-2 rounded bg-[#3d3326]">
                    {mySelectedCard.name}
                  </div>
                ) : (
                  <div className="text-red-500 font-bold uppercase text-xs italic">Nenhuma selecionada</div>
                )}
                
                <button 
                  onClick={handleReady}
                  disabled={!me.cardId}
                  className={`mt-4 w-full py-2 rounded font-bold uppercase text-xs transition-colors ${
                    me.agreed ? 'bg-green-600 text-white' : 'bg-[#a67c52] text-black hover:bg-[#e2b17a]'
                  } disabled:opacity-50`}
                >
                  {me.agreed ? '✓ Confirmado' : 'Confirmar Troca'}
                </button>
             </div>
          </div>
          
          <div className="flex items-center justify-center">
             <span className="text-3xl text-[#a67c52]">⇌</span>
          </div>
          
          {/* Opponent Side */}
          <div className="flex-1 flex flex-col border border-[#3d3326] rounded p-4 bg-[#0f0e0c]">
             <h3 className="text-sm font-bold uppercase text-[#a67c52] mb-4 text-center">Amigo ({opp.username})</h3>
             
             <div className="flex-1 flex flex-col items-center justify-center mb-4 border border-[#3d3326] p-4 bg-black/50 rounded">
                <span className="text-xs uppercase text-[#d4c3a1]/60 mb-4">Oferta do Amigo</span>
                {opponentCard ? (
                  <div className="w-32 aspect-[2/3] border-2 border-[#a67c52] rounded relative bg-[#1a1814]">
                    {opponentCard.imageUrl ? (
                      <img src={opponentCard.imageUrl} alt={opponentCard.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-xs font-bold uppercase text-[#a67c52] leading-tight">{opponentCard.name}</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-[#a67c52] text-black text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">
                      {opponentCard.points}
                    </div>
                  </div>
                ) : (
                  <div className="w-32 aspect-[2/3] border-2 border-dashed border-[#3d3326] rounded flex flex-col items-center justify-center text-[#d4c3a1]/30">
                     <span className="text-xs uppercase font-bold text-center">Aguardando escolha...</span>
                  </div>
                )}
                
                {opponentCard && (
                   <div className="mt-4 text-[#e2b17a] font-bold uppercase text-sm">{opponentCard.name}</div>
                )}
             </div>
             
             <div className="flex flex-col items-center border-t border-[#3d3326] pt-4 justify-center h-[90px]">
                {opp.agreed ? (
                  <span className="text-green-500 font-bold uppercase text-sm flex items-center gap-2">
                    ✓ Confirmado
                  </span>
                ) : (
                  <span className="text-[#d4c3a1]/50 font-bold uppercase text-xs italic">
                    Analisando...
                  </span>
                )}
             </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[#3d3326]">
          <button 
            onClick={handleCancel}
            className="px-4 py-2 bg-red-950/50 text-red-500 uppercase font-bold text-xs hover:bg-red-900 transition-colors rounded"
          >
            Cancelar Troca
          </button>
        </div>
      </div>
    </div>
  );
}
