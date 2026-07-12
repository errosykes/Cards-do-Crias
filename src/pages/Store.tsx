import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CardPack, Card } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Store as StoreIcon, ArrowLeft, Coins, PackageOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { loadAllCards, getAllCachedCards } from '../lib/cardsCache';
import { motion, AnimatePresence } from 'motion/react';
import { getCachedCard } from '../lib/cardsCache';
import { CardModal } from '../components/CardModal';

export default function Store() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [packs, setPacks] = useState<CardPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [allCards, setAllCards] = useState<Card[]>([]);
  
  const [openingPack, setOpeningPack] = useState<CardPack | null>(null);
  const [openedCards, setOpenedCards] = useState<Card[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const [viewingPack, setViewingPack] = useState<CardPack | null>(null);
  const [selectedCardToView, setSelectedCardToView] = useState<Card | null>(null);
  const [viewingLargePackImage, setViewingLargePackImage] = useState<string | null>(null);
  
  const cruzeiros = userData?.cruzeiros || 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'cardPacks'));
        const fetched: CardPack[] = [];
        snap.forEach(d => {
          fetched.push({ id: d.id, ...d.data() } as CardPack);
        });
        setPacks(fetched);
        
        await loadAllCards();
        setAllCards(getAllCachedCards());
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleBuyPack = async (pack: CardPack) => {
    if (!userData) return;
    if (cruzeiros < pack.price) {
      console.log('Cruzeiros insuficientes!');
      return;
    }
    
    if (!pack.cards || pack.cards.length === 0) {
      console.log('Este pacote está vazio!');
      return;
    }

    setIsOpening(true);
    setOpeningPack(pack);
    
    try {
      // Calculate drop
      let totalWeight = 0;
      pack.cards.forEach(c => totalWeight += c.weight);
      
      const numCardsToDraw = pack.cardsPerPack || 1;
      const drawnCardIds: string[] = [];
      const drawnCards: Card[] = [];

      for (let i = 0; i < numCardsToDraw; i++) {
        let rand = Math.random() * totalWeight;
        let selectedCardId = pack.cards[0].cardId;
        
        for (const c of pack.cards) {
           if (rand < c.weight) {
              selectedCardId = c.cardId;
              break;
           }
           rand -= c.weight;
        }
        drawnCardIds.push(selectedCardId);
        const card = allCards.find(c => c.id === selectedCardId);
        if (card) {
          drawnCards.push(card);
        }
      }
      
      // Add card to user inventory and deduct C$
      const currentInventory = userData.inventory || [];
      await updateDoc(doc(db, 'users', userData.uid), {
         cruzeiros: cruzeiros - pack.price,
         inventory: [...currentInventory, ...drawnCardIds]
      });
      
      // Simulate opening delay
      setIsTearing(false);
      setTimeout(() => {
         setIsTearing(true);
      }, 1500);

      setTimeout(() => {
         setOpenedCards(drawnCards);
         setIsOpening(false);
         setIsTearing(false);
      }, 2500);

    } catch (e) {
      console.error(e);
      setIsOpening(false);
      setOpeningPack(null);
      console.log('Erro ao comprar o pacote.');
    }
  };

  const closeOpening = () => {
    setOpeningPack(null);
    setOpenedCards([]);
  };

  return (
    <div className="min-h-screen bg-[#0f0e0c] text-[#d4c3a1] font-serif flex flex-col">
      <div className="p-4 md:p-8 flex flex-col md:flex-row justify-between items-center bg-[#141210] border-b border-[#3d3326] shadow-2xl relative z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 bg-[#3d3326] hover:bg-[#a67c52] rounded transition-colors text-[#d4c3a1] hover:text-[#1a1814]"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
             <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-[#a67c52] uppercase flex items-center gap-3">
               <StoreIcon className="w-6 h-6" /> Loja de Cartas
             </h1>
             <p className="text-xs text-[#d4c3a1]/60 uppercase tracking-widest font-sans mt-1">
               Adquira novos pacotes e expanda seu deck
             </p>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center gap-3 bg-[#1a1814] px-4 py-2 border border-[#3d3326] rounded-full shadow-inner">
           <Coins className="w-5 h-5 text-yellow-500" />
           <span className="text-xl font-bold text-yellow-500">{cruzeiros} C$</span>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
         {loading ? (
           <div className="flex items-center justify-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a67c52]"></div>
           </div>
         ) : packs.length === 0 ? (
           <div className="text-center text-[#d4c3a1]/50 italic mt-20">
              Nenhum pacote disponível na loja no momento.
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {packs.map(pack => (
                 <motion.div 
                   key={pack.id}
                   whileHover={{ y: -10, scale: 1.02 }}
                   className="bg-[#1a1814] border-2 border-[#3d3326] rounded-xl overflow-hidden flex flex-col shadow-2xl group relative"
                 >
                    <div className="h-48 md:h-64 relative bg-black/50 overflow-hidden cursor-pointer" onClick={() => handleBuyPack(pack)}>
                       {pack.imageUrl ? (
                          <img src={pack.imageUrl} alt={pack.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                       ) : (
                          <div className="flex items-center justify-center h-full">
                             <PackageOpen className="w-16 h-16 text-[#3d3326]" />
                          </div>
                       )}
                       <div className="absolute inset-0 bg-gradient-to-t from-[#1a1814] to-transparent pointer-events-none"></div>
                    </div>
                    
                    <div className="p-4 flex flex-col items-center text-center -mt-8 relative z-10">
                       <h2 className="text-xl font-black uppercase text-[#e2b17a] drop-shadow-md">{pack.name}</h2>
                       <p className="text-[10px] text-[#d4c3a1]/60 uppercase tracking-widest mt-1 mb-2">
                         Pode conter {pack.cards?.length || 0} cartas | Vem {pack.cardsPerPack || 1}
                       </p>
                       <button
                         onClick={(e) => { e.stopPropagation(); setViewingPack(pack); }}
                         className="mb-4 text-xs font-bold uppercase text-[#a67c52] hover:text-[#e2b17a] underline transition-colors"
                       >
                         Ver Cartas do Pacote
                       </button>
                       
                       <button 
                         onClick={() => handleBuyPack(pack)}
                         className="w-full py-3 bg-gradient-to-r from-yellow-700 to-yellow-600 hover:from-yellow-600 hover:to-yellow-500 text-black font-black uppercase tracking-widest rounded shadow-[0_0_15px_rgba(202,138,4,0.3)] transition-all"
                         disabled={cruzeiros < pack.price}
                       >
                         {cruzeiros < pack.price ? 'C$ Insuficiente' : `Comprar por ${pack.price} C$`}
                       </button>
                    </div>
                 </motion.div>
              ))}
           </div>
         )}
      </div>

      {/* Opening Overlay */}
      <AnimatePresence>
        {(isOpening || openedCards.length > 0) && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
           >
             {isOpening ? (
                <div className="flex flex-col items-center justify-center gap-8 relative w-full h-full max-w-4xl">
                   {!isTearing ? (
                       <motion.div 
                         animate={{ 
                           rotate: [0, -5, 5, -5, 5, 0],
                           scale: [1, 1.05, 1],
                         }}
                         transition={{ duration: 0.3, repeat: Infinity }}
                         className="w-48 h-64 md:w-64 md:h-80 bg-[#3d3326] rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.8)] flex items-center justify-center relative overflow-hidden"
                       >
                         {openingPack?.imageUrl && (
                            <img src={openingPack.imageUrl} alt="Pack" className="absolute inset-0 w-full h-full object-cover" />
                         )}
                         
                       </motion.div>
                   ) : (
                       <div className="relative w-48 h-64 md:w-64 md:h-80">
                         {/* Left Half */}
                         <motion.div 
                           initial={{ x: 0, rotate: 0, opacity: 1 }}
                           animate={{ x: -150, rotate: -25, opacity: 0 }}
                           transition={{ duration: 0.8, ease: "easeOut" }}
                           className="absolute inset-0 bg-[#3d3326] rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.8)] overflow-hidden"
                           style={{ clipPath: 'polygon(0 0, 50% 0, 45% 20%, 55% 40%, 45% 60%, 55% 80%, 50% 100%, 0 100%)' }}
                         >
                           {openingPack?.imageUrl && (
                              <img src={openingPack.imageUrl} alt="Pack" className="absolute inset-0 w-full h-full object-cover" />
                           )}
                         </motion.div>
                         {/* Right Half */}
                         <motion.div 
                           initial={{ x: 0, rotate: 0, opacity: 1 }}
                           animate={{ x: 150, rotate: 25, opacity: 0 }}
                           transition={{ duration: 0.8, ease: "easeOut" }}
                           className="absolute inset-0 bg-[#3d3326] rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.8)] overflow-hidden"
                           style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 55% 80%, 45% 60%, 55% 40%, 45% 20%)' }}
                         >
                           {openingPack?.imageUrl && (
                              <img src={openingPack.imageUrl} alt="Pack" className="absolute inset-0 w-full h-full object-cover" />
                           )}
                         </motion.div>
                         <motion.div
                           initial={{ scale: 0, opacity: 0 }}
                           animate={{ scale: [1, 1.5, 2], opacity: [1, 0] }}
                           transition={{ duration: 0.8 }}
                           className="absolute inset-0 flex items-center justify-center pointer-events-none"
                         >
                            <div className="w-full h-full bg-yellow-500 rounded-full blur-[50px]"></div>
                         </motion.div>
                       </div>
                   )}
                   <h2 className="text-2xl md:text-4xl font-black uppercase tracking-[0.2em] text-yellow-500 animate-pulse text-center">
                     {isTearing ? "Rasgando Pacote!" : "Abrindo Pacote..."}
                   </h2>
                </div>
             ) : openedCards.length > 0 ? (
                <div className="flex flex-col items-center justify-center gap-8 relative w-full max-w-6xl">
                   <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-[#e2b17a] drop-shadow-[0_0_20px_rgba(226,177,122,0.8)] text-center absolute -top-20">
                     Novas Cartas!
                   </h2>
                   
                   <div className="flex flex-wrap justify-center gap-6 max-h-[70vh] overflow-y-auto no-scrollbar pb-10">
                     {openedCards.map((card, idx) => (
                       <motion.div
                         key={idx}
                         initial={{ scale: 0, rotateY: 180 }}
                         animate={{ scale: 1, rotateY: 0 }}
                         transition={{ type: 'spring', stiffness: 100, damping: 15, delay: idx * 0.2 }}
                         className="flex justify-center"
                       >
                         <div className="w-56 h-80 md:w-64 md:h-96 bg-[#3d3326] border-4 border-[#e2b17a] rounded-xl overflow-hidden shadow-[0_0_30px_rgba(226,177,122,0.4)] relative group flex-shrink-0">
                            {card.imageUrl ? (
                               <img src={card.imageUrl} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                               <div className="absolute inset-0 flex items-center justify-center">Sem Imagem</div>
                            )}
                            <div className="absolute top-2 left-2 w-10 h-10 bg-[#a67c52] rounded-full border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-lg">
                               {card.points}
                            </div>
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 border border-[#a67c52] rounded text-xs font-bold uppercase text-[#e2b17a]">
                               {card.type}
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-10 text-center">
                               <h3 className="text-xl font-black uppercase text-white mb-2 leading-tight">{card.name}</h3>
                               <p className="text-xs text-gray-300 italic">{card.description}</p>
                            </div>
                         </div>
                       </motion.div>
                     ))}
                   </div>
                   
                   <motion.button
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 1 }}
                     onClick={closeOpening}
                     className="absolute -bottom-20 px-8 py-3 bg-[#a67c52] hover:bg-[#e2b17a] text-black font-black uppercase tracking-widest rounded transition-colors"
                   >
                     Continuar
                   </motion.button>
                </div>
             ) : null}
           </motion.div>
        )}
      </AnimatePresence>

      {/* Viewing Pack Modal */}
      {viewingPack && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setViewingPack(null)}>
          <div className="bg-[#1a1814] border-2 border-[#a67c52] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col gap-6 shadow-[0_0_50px_rgba(166,124,82,0.3)] relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingPack(null)} className="absolute top-4 right-4 text-2xl text-[#a67c52] hover:text-[#e2b17a]">
              &times;
            </button>
            <div className="flex flex-col items-center border-b border-[#3d3326] pb-4">
              {viewingPack.imageUrl && (
                <img src={viewingPack.imageUrl} alt={viewingPack.name} className="w-48 h-48 object-contain rounded-xl border border-[#a67c52] mb-4 shadow-lg shadow-black/50 cursor-pointer hover:scale-105 transition-transform" onClick={() => setViewingLargePackImage(viewingPack.imageUrl)} />
              )}
              <h2 className="text-2xl font-black uppercase tracking-widest text-[#e2b17a] text-center">
                Cartas em: {viewingPack.name}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {viewingPack.cards.map((packItem) => {
                const card = allCards.find(c => c.id === packItem.cardId);
                if (!card) return null;
                return (
                  <div key={card.id} className="bg-[#0f0e0c] border border-[#3d3326] rounded-md p-2 flex flex-col items-center gap-2 cursor-pointer hover:border-[#a67c52] transition-colors" onClick={() => setSelectedCardToView(card)}>
                     <div className="w-full aspect-[2/3] relative rounded overflow-hidden border border-[#3d3326]">
                        {card.imageUrl ? (
                           <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-[#1a1814]">
                              <span className="font-bold text-[10px] uppercase text-[#a67c52]">{card.name}</span>
                           </div>
                        )}
                        <div className="absolute top-1 left-1 w-6 h-6 bg-[#a67c52] rounded-full flex items-center justify-center text-xs font-bold text-black">
                          {card.points}
                        </div>
                     </div>
                     <div className="text-center w-full">
                       <h3 className="text-xs font-bold text-white truncate w-full px-1">{card.name}</h3>
                       <p className="text-[10px] text-gray-500">Peso: {packItem.weight}</p>
                     </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Card Detail Modal */}
      {viewingLargePackImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 p-4" onClick={() => setViewingLargePackImage(null)}>
          <div className="relative max-w-7xl max-h-[90vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewingLargePackImage(null)} className="absolute -top-12 right-0 text-3xl text-white hover:text-[#e2b17a]">
              &times;
            </button>
            <img src={viewingLargePackImage} alt="Pack" className="max-w-full max-h-[85vh] object-contain rounded border-2 border-[#a67c52]" />
          </div>
        </div>
      )}

      {selectedCardToView && (
        <CardModal card={selectedCardToView} onClose={() => setSelectedCardToView(null)} />
      )}
    </div>
  );
}
