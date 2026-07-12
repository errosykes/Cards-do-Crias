import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card } from '../types';
import { Save, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function AdminCampaignsTab({ cards }: { cards: Card[] }) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Campaign Form
  const [isEditingCamp, setIsEditingCamp] = useState<string | null>(null);
  const [campTitle, setCampTitle] = useState('');
  const [campType, setCampType] = useState('tournament');
  const [campDesc, setCampDesc] = useState('');

  // NPC Form
  const [isEditingNpc, setIsEditingNpc] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [diff, setDiff] = useState('normal');
  const [imageUrl, setImageUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [deck, setDeck] = useState<string[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const campSnap = await getDocs(collection(db, 'campaigns'));
      let fetchedCamps: any[] = campSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      fetchedCamps.sort((a: any, b: any) => a.order - b.order);
      if (fetchedCamps.length === 0) {
         // Create default tournament 1
         await setDoc(doc(db, 'campaigns', 'tournament-1'), {
           title: '1º Torneio',
           type: 'tournament',
           description: 'Torneio Clássico',
           order: 1
         });
         fetchedCamps = [{ id: 'tournament-1', title: '1º Torneio', type: 'tournament', description: 'Torneio Clássico', order: 1 }];
      }
      setCampaigns(fetchedCamps);
      
      const npcSnap = await getDocs(collection(db, 'tournament_npcs'));
      const fetchedNpcs = npcSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNpcs(fetchedNpcs);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditCamp = (camp: any) => {
    setIsEditingCamp(camp.id);
    setCampTitle(camp.title);
    setCampType(camp.type || 'tournament');
    setCampDesc(camp.description || '');
  };

  const handleDeleteCamp = async (id: string) => {
    if (!confirm('Excluir Campanha? Todos os NPCs dessa campanha ficarão sem campanha associada se não forem apagados.')) return;
    try {
      await deleteDoc(doc(db, 'campaigns', id));
      fetchData();
    } catch(e) {
      console.log('Erro ao apagar');
    }
  };

  const resetCampForm = () => {
    setIsEditingCamp(null);
    setCampTitle('');
    setCampType('tournament');
    setCampDesc('');
  };

  const handleCampSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = isEditingCamp || uuidv4();
    const order = isEditingCamp ? campaigns.find(c => c.id === id)?.order : (campaigns.length > 0 ? Math.max(...campaigns.map(c => c.order)) + 1 : 1);
    
    try {
      await setDoc(doc(db, 'campaigns', id), {
        title: campTitle,
        type: campType,
        description: campDesc,
        order
      });
      fetchData();
      resetCampForm();
    } catch(e) {
      console.log('Erro ao salvar Campanha');
    }
  };

  const resetNpcForm = () => {
    setIsEditingNpc(null);
    setName('');
    setDesc('');
    setDiff('normal');
    setImageUrl('');
    setBackgroundUrl('');
    setDeck([]);
  };

  const handleNpcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return console.log('Selecione uma campanha primeiro');
    
    const id = isEditingNpc || uuidv4();
    const campaignNpcs = npcs.filter(n => (n.campaignId || 'tournament-1') === selectedCampaignId);
    
    const order = isEditingNpc ? npcs.find(n => n.id === id)?.order : (campaignNpcs.length > 0 ? Math.max(...campaignNpcs.map(n => n.order)) + 1 : 1);
    
    const npc = {
      id,
      campaignId: selectedCampaignId,
      order,
      name,
      desc,
      diff,
      imageUrl,
      backgroundUrl,
      deck
    };
    
    try {
      await setDoc(doc(db, 'tournament_npcs', id), npc);
      fetchData();
      resetNpcForm();
    } catch(e) {
      console.log('Erro ao salvar NPC');
    }
  };
  
  const handleEditNpc = (npc: any) => {
    setIsEditingNpc(npc.id);
    setName(npc.name || '');
    setDesc(npc.desc || '');
    setDiff(npc.diff || 'normal');
    setImageUrl(npc.imageUrl || '');
    setBackgroundUrl(npc.backgroundUrl || '');
    setDeck(npc.deck || []);
  };

  const moveNpcOrder = async (idx: number, dir: 'up' | 'down') => {
    if (!selectedCampaignId) return;
    const campaignNpcs = npcs.filter(n => (n.campaignId || 'tournament-1') === selectedCampaignId).sort((a, b) => a.order - b.order);
    
    if (dir === 'up' && idx > 0) {
       const temp = campaignNpcs[idx].order;
       campaignNpcs[idx].order = campaignNpcs[idx - 1].order;
       campaignNpcs[idx - 1].order = temp;
    } else if (dir === 'down' && idx < campaignNpcs.length - 1) {
       const temp = campaignNpcs[idx].order;
       campaignNpcs[idx].order = campaignNpcs[idx + 1].order;
       campaignNpcs[idx + 1].order = temp;
    }
    
    try {
       for (const n of campaignNpcs) {
          await setDoc(doc(db, 'tournament_npcs', n.id), n);
       }
       fetchData();
    } catch(e) {
       console.error(e);
    }
  };
  
  const handleDeleteNpc = async (id: string) => {
    if (!confirm('Excluir NPC?')) return;
    try {
      await deleteDoc(doc(db, 'tournament_npcs', id));
      fetchData();
    } catch(e) {
      console.error(e);
    }
  };

  if (loading) return <div>Carregando...</div>;

  const currentCampaignNpcs = selectedCampaignId ? npcs.filter(n => (n.campaignId || 'tournament-1') === selectedCampaignId).sort((a, b) => a.order - b.order) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 border-b border-[#3d3326] pb-2">
        <h2 className="text-xl font-black uppercase text-[#e2b17a]">Gerenciar Campanhas</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Campanhas Sidebar */}
        <div className="bg-[#141210] border border-[#3d3326] rounded p-4 shadow-2xl col-span-1">
           <h3 className="text-xs font-bold tracking-tighter text-[#a67c52] uppercase mb-4">Campanhas</h3>
           <div className="flex flex-col gap-2 mb-4">
             {campaigns.map(c => (
               <div key={c.id} className="flex flex-col mb-1">
                 <div className="flex">
                   <button 
                      onClick={() => { setSelectedCampaignId(c.id); resetNpcForm(); }}
                      className={`p-2 flex-1 text-left text-xs uppercase font-bold rounded-l border ${selectedCampaignId === c.id ? 'bg-[#3d3326] border-[#a67c52] text-[#e2b17a]' : 'bg-[#0f0e0c] border-[#3d3326] border-r-0 text-[#d4c3a1]/60'}`}
                   >
                     [{c.type}] {c.title}
                   </button>
                   <button onClick={() => handleEditCamp(c)} className="bg-[#1a1814] border-y border-r border-[#3d3326] px-2 text-blue-400 hover:bg-[#3d3326]">
                     <Edit className="w-3 h-3" />
                   </button>
                   <button onClick={() => handleDeleteCamp(c.id)} className="bg-[#1a1814] border-y border-r border-[#3d3326] rounded-r px-2 text-red-500 hover:bg-red-900/40">
                     <Trash2 className="w-3 h-3" />
                   </button>
                 </div>
               </div>
             ))}
           </div>
           
           <form onSubmit={handleCampSubmit} className="pt-4 border-t border-[#3d3326] space-y-2">
             <h4 className="text-[10px] text-green-500 uppercase font-bold">{isEditingCamp ? 'Editar Campanha' : 'Nova Campanha'}</h4>
             <input type="text" placeholder="Título" value={campTitle} onChange={e => setCampTitle(e.target.value)} required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-1 text-xs text-[#d4c3a1]" />
             <select value={campType} onChange={e => setCampType(e.target.value)} className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-1 text-xs text-[#d4c3a1]">
                <option value="tournament">Torneio</option>
                <option value="event">Evento</option>
                <option value="mission">Missão</option>
             </select>
             <input type="text" placeholder="Descrição" value={campDesc} onChange={e => setCampDesc(e.target.value)} className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-1 text-xs text-[#d4c3a1]" />
             <div className="flex gap-1">
               {isEditingCamp && <button type="button" onClick={resetCampForm} className="flex-1 bg-red-900/40 text-red-500 rounded text-[10px] py-1">Cancelar</button>}
               <button type="submit" className="flex-1 bg-[#3d3326] text-[#e2b17a] rounded text-[10px] py-1 font-bold">Salvar</button>
             </div>
           </form>
        </div>
        
        {/* Conteúdo da Campanha Selecionada */}
        {selectedCampaignId ? (
           <div className="bg-[#141210] border border-[#3d3326] rounded p-6 shadow-2xl col-span-1 lg:col-span-3">
             <div className="flex flex-col lg:flex-row gap-8">
               {/* Formulário NPC */}
               <div className="flex-1">
                 <h3 className="text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-4">{isEditingNpc ? 'Editar NPC' : 'Criar Novo NPC na Campanha'}</h3>
                 <form onSubmit={handleNpcSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Nome</label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Descrição</label>
                      <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Dificuldade</label>
                      <select value={diff} onChange={e => setDiff(e.target.value)} className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]">
                         <option value="easy">Fácil</option>
                         <option value="normal">Médio</option>
                         <option value="hard">Difícil</option>
                         <option value="expert">Mestre (Adaptive)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">URL da Imagem (Avatar)</label>
                      <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">URL do Papel de Parede (Background)</label>
                      <input type="url" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
                    </div>
                    <div className="mt-4 border-t border-[#3d3326] pt-4">
                       <h4 className="text-sm font-bold uppercase text-[#a67c52] mb-2">Deck Customizado ({deck.length}/30)</h4>
                       <div className="max-h-40 overflow-y-auto pr-2 no-scrollbar space-y-1 bg-[#0f0e0c] p-2 rounded border border-[#3d3326]">
                          {cards.map(card => {
                             const count = deck.filter(id => id === card.id).length;
                             return (
                                <div key={card.id} className="flex justify-between items-center bg-[#1a1814] p-1 rounded text-xs border border-[#3d3326]">
                                   <span className="truncate text-gray-300 w-32">{card.name}</span>
                                   <div className="flex gap-1 items-center">
                                      <span className="w-4 text-center font-bold text-[#a67c52]">{count}</span>
                                      <button type="button" onClick={() => setDeck([...deck, card.id])} className="bg-green-900/40 text-green-500 px-1 rounded">+</button>
                                      <button type="button" onClick={() => setDeck(deck.filter((_, i) => i !== deck.lastIndexOf(card.id)))} disabled={count === 0} className="bg-red-900/40 text-red-500 px-1 rounded disabled:opacity-30">-</button>
                                   </div>
                                </div>
                             )
                          })}
                       </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      {isEditingNpc && <button type="button" onClick={resetNpcForm} className="flex-1 bg-[#3d3326] hover:bg-[#4a3e2f] py-2 rounded text-xs font-bold uppercase transition-colors">Cancelar</button>}
                      <button type="submit" className="flex-1 bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black py-2 rounded text-xs font-bold uppercase transition-colors">
                        {isEditingNpc ? 'Atualizar NPC' : 'Criar NPC'}
                      </button>
                    </div>
                 </form>
               </div>
               
               {/* Lista NPCs da Campanha */}
               <div className="flex-1">
                 <h3 className="text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-4">Inimigos na Campanha</h3>
                 <div className="flex flex-col gap-3">
                    {currentCampaignNpcs.map((npc, idx) => (
                       <div key={npc.id} className="bg-[#1a1814] border border-[#3d3326] p-3 rounded flex items-center justify-between gap-2">
                          <span className="text-lg font-black text-[#a67c52]/30">{npc.order}</span>
                          <div className="flex flex-col flex-1">
                             <h4 className="font-bold text-[#e2b17a] uppercase text-xs">{npc.name}</h4>
                             <span className="text-[9px] text-gray-500 uppercase">{npc.diff} | {npc.deck?.length || 0} cartas</span>
                          </div>
                          <div className="flex gap-1">
                             <button onClick={() => moveNpcOrder(idx, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
                             <button onClick={() => moveNpcOrder(idx, 'down')} disabled={idx === currentCampaignNpcs.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-30"><ArrowDown className="w-3 h-3" /></button>
                             <button onClick={() => handleEditNpc(npc)} className="p-1 text-blue-400"><Edit className="w-3 h-3" /></button>
                             <button onClick={() => handleDeleteNpc(npc.id)} className="p-1 text-red-500"><Trash2 className="w-3 h-3" /></button>
                          </div>
                       </div>
                    ))}
                 </div>
               </div>
             </div>
           </div>
        ) : (
           <div className="bg-[#141210] border border-[#3d3326] rounded p-6 shadow-2xl col-span-1 lg:col-span-3 flex items-center justify-center text-[#d4c3a1]/50 text-sm uppercase font-bold">
              Selecione ou crie uma campanha ao lado.
           </div>
        )}
      </div>
    </div>
  );
}
