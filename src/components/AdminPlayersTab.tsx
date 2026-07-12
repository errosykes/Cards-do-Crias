import React, { useState } from 'react';
import { User, Card } from '../types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Plus, Minus, Trash2, Wallet, RefreshCw } from 'lucide-react';

interface Props {
  players: User[];
  cards: Card[];
  fetchPlayers: () => void;
}

export function AdminPlayersTab({ players, cards, fetchPlayers }: Props) {
  const [message, setMessage] = useState('');
  
  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };
  
  
  const handleUpdateCruzeiros = async (uid: string, currentAmount: number, change: number) => {
    try {
      const newAmount = Math.max(0, currentAmount + change);
      await updateDoc(doc(db, 'users', uid), {
        cruzeiros: newAmount
      });
      fetchPlayers();
    } catch (e) {
      console.error(e);
      showMessage("Erro ao executar ação!");
    }
  };

  const [resetConfirm, setResetConfirm] = useState<string | null>(null);
  
  const handleResetAccount = async (player: User) => {
    
    try {
      await updateDoc(doc(db, 'users', player.uid), {
        inventory: [],
        deck: [],
        savedDecks: [],
        activeDeckId: null,
        matchHistory: [],
        hasAllCards: false,
        cruzeiros: 0,
        tournamentProgress: 1
      });
      showMessage("Conta resetada com sucesso!");
      setResetConfirm(null);
      fetchPlayers();
    } catch (e) {
      console.error(e);
      showMessage("Erro ao executar ação!");
    }
  };

  const handleAddCard = async (e: React.FormEvent, player: User) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const cardIdInput = form.elements.namedItem('cardId') as HTMLSelectElement;
    const quantityInput = form.elements.namedItem('quantity') as HTMLInputElement;
    
    const cardId = cardIdInput.value.trim();
    const qty = parseInt(quantityInput.value) || 1;
    
    if (!cardId || qty < 1) return;
    
    const newInventory = [...(player.inventory || [])];
    for (let i = 0; i < qty; i++) {
      newInventory.push(cardId);
    }
    
    try {
      await updateDoc(doc(db, 'users', player.uid), {
        inventory: newInventory
      });
      showMessage(`Adicionadas ${qty} carta(s) ao jogador ${player.username}`);
      fetchPlayers();
      form.reset();
    } catch (err) {
      console.error(err);
      showMessage("Erro ao executar ação!");
    }
  };

  const handleRemoveCard = async (e: React.FormEvent, player: User) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const cardIdInput = form.elements.namedItem('cardId') as HTMLSelectElement;
    const quantityInput = form.elements.namedItem('quantity') as HTMLInputElement;
    
    const cardId = cardIdInput.value.trim();
    const qty = parseInt(quantityInput.value) || 1;
    
    if (!cardId || qty < 1) return;
    
    const newInventory = [...(player.inventory || [])];
    
    let removed = 0;
    for (let i = newInventory.length - 1; i >= 0; i--) {
      if (newInventory[i] === cardId && removed < qty) {
        newInventory.splice(i, 1);
        removed++;
      }
    }
    
    try {
      await updateDoc(doc(db, 'users', player.uid), {
        inventory: newInventory,
        deck: (player.deck || []).filter(id => newInventory.includes(id)) // basic cleanup if deck has removed cards, though it's imperfect
      });
      showMessage(`Removida(s) ${removed} carta(s) do jogador ${player.username}`);
      fetchPlayers();
      form.reset();
    } catch (err) {
      console.error(err);
      showMessage("Erro ao executar ação!");
    }
  };


  return (
    <div className="bg-[#1a1814] border border-[#3d3326] rounded p-6 shadow-2xl">
      <h2 className="text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-4">Jogadores Registrados ({players.length})</h2>
      {message && <div className="mb-4 p-2 bg-green-900/50 text-green-500 border border-green-500/50 rounded text-center text-sm font-bold">{message}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map(player => (
          <div key={player.uid} className="bg-[#141210] border border-[#3d3326] rounded p-4 shadow-md flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                 <div className="flex items-center gap-2">
                   <h3 className="font-bold text-sm uppercase text-[#e2b17a]">{player.username}</h3>
                   {player.hasAllCards && player.role !== 'admin' && (
                      <span className="text-[8px] bg-green-900/40 text-green-400 border border-green-500/30 px-1 rounded uppercase tracking-wider">
                         All Cards
                      </span>
                   )}
                 </div>
                 <span className="text-[10px] text-[#d4c3a1]/50 truncate max-w-[200px]">{player.email}</span>
                 <span className="text-[8px] font-mono text-[#a67c52]/50 mt-1">UID: {player.uid}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${player.role === 'admin' ? 'bg-[#a67c52]/20 text-[#a67c52] border border-[#a67c52]/30' : 'bg-[#3d3326] text-[#d4c3a1]/60'}`}>
                {player.role}
              </span>
            </div>
            
            {/* Stats */}
            <div className="flex flex-col gap-1 bg-[#1a1814] p-2 rounded border border-[#3d3326]">
              <div className="flex justify-between text-[10px] uppercase font-bold text-[#d4c3a1]">
                <span>Inventário: {player.inventory?.length || 0}</span>
                <span>Baralho: {player.deck?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-[#3d3326]/50">
                <span className="text-[10px] uppercase font-bold text-[#e2b17a] flex items-center gap-1">
                  <Wallet className="w-3 h-3" /> C$ {player.cruzeiros || 0}
                </span>
                <div className="flex gap-1">
                   <button onClick={() => handleUpdateCruzeiros(player.uid, player.cruzeiros || 0, -100)} className="w-5 h-5 bg-red-900/40 hover:bg-red-900/80 text-red-500 rounded flex items-center justify-center border border-red-500/30" title="Tirar 100 C$">-</button>
                   <button onClick={() => handleUpdateCruzeiros(player.uid, player.cruzeiros || 0, 100)} className="w-5 h-5 bg-green-900/40 hover:bg-green-900/80 text-green-500 rounded flex items-center justify-center border border-green-500/30" title="Dar 100 C$">+</button>
                </div>
              </div>
            </div>
            
            {/* Toggles */}
            <div>
               <button
                 onClick={async () => {
                    try {
                       await updateDoc(doc(db, 'users', player.uid), {
                          hasAllCards: !player.hasAllCards
                       });
                       fetchPlayers();
                       showMessage("Status de cartas atualizado com sucesso!");
                    } catch (e) {
                       console.error(e);
                    }
                 }}
                 className={`w-full py-1.5 rounded text-[10px] uppercase font-bold tracking-widest transition-colors ${player.hasAllCards ? 'bg-[#a67c52] text-[#141210] hover:bg-[#a67c52]/80' : 'bg-[#3d3326] text-[#d4c3a1]/80 hover:bg-[#4d4030]'}`}
               >
                 {player.hasAllCards ? 'Desativar Todas as Cartas' : 'Liberar Todas as Cartas'}
               </button>
            </div>
            
            {/* Give/Take Cards */}
            <div className="mt-auto flex flex-col gap-2">
              <form onSubmit={(e) => handleAddCard(e, player)} className="flex flex-col gap-1 bg-[#1a1814] p-2 rounded border border-[#3d3326]">
                <label className="text-[9px] uppercase font-bold text-green-500">Dar Carta</label>
                <div className="flex gap-1">
                  <select name="cardId" required className="flex-1 bg-black/50 border border-[#3d3326] rounded px-1 py-1 text-[10px] text-[#d4c3a1] focus:outline-none">
                    <option value="">Selecione...</option>
                    {cards.map(c => <option key={`add-${c.id}`} value={c.id}>{c.name}</option>)}
                  </select>
                  <input name="quantity" type="number" min="1" defaultValue="1" required className="w-10 bg-black/50 border border-[#3d3326] rounded px-1 py-1 text-[10px] text-[#d4c3a1] focus:outline-none text-center" />
                  <button type="submit" className="bg-green-900/40 hover:bg-green-900/80 text-green-500 px-2 rounded border border-green-500/30 flex items-center justify-center">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </form>
              
              <form onSubmit={(e) => handleRemoveCard(e, player)} className="flex flex-col gap-1 bg-[#1a1814] p-2 rounded border border-[#3d3326]">
                <label className="text-[9px] uppercase font-bold text-red-500">Tirar Carta (do Inventário)</label>
                <div className="flex gap-1">
                  <select name="cardId" required className="flex-1 bg-black/50 border border-[#3d3326] rounded px-1 py-1 text-[10px] text-[#d4c3a1] focus:outline-none">
                    <option value="">Selecione...</option>
                    {/* Only show cards the player actually has to make it easier, or all cards? Let's show all cards so they can search, but ideally grouped or filtered */}
                    {Array.from(new Set(player.inventory || [])).map(cardId => {
                       const c = cards.find(c => c.id === cardId);
                       if (!c) return null;
                       const count = (player.inventory || []).filter(id => id === cardId).length;
                       return <option key={`remove-${c.id}`} value={c.id}>{c.name} (Tem {count})</option>;
                    })}
                  </select>
                  <input name="quantity" type="number" min="1" defaultValue="1" required className="w-10 bg-black/50 border border-[#3d3326] rounded px-1 py-1 text-[10px] text-[#d4c3a1] focus:outline-none text-center" />
                  <button type="submit" className="bg-red-900/40 hover:bg-red-900/80 text-red-500 px-2 rounded border border-red-500/30 flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="mt-2 pt-2 border-t border-red-900/30">
               {resetConfirm === player.uid ? (
                 <div className="flex gap-2">
                   <button
                     onClick={() => handleResetAccount(player)}
                     className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white border border-red-500 rounded text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center"
                   >
                     Confirmar
                   </button>
                   <button
                     onClick={() => setResetConfirm(null)}
                     className="flex-1 py-1.5 bg-gray-600 hover:bg-gray-700 text-white border border-gray-500 rounded text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center"
                   >
                     Cancelar
                   </button>
                 </div>
               ) : (
                 <button
                   onClick={() => setResetConfirm(player.uid)}
                   className="w-full py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-1"
                 >
                   <RefreshCw className="w-3 h-3" />
                   Resetar Conta (Apagar tudo)
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
