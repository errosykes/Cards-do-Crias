import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardPack, CardPackItem } from '../types';
import { Package, Trash2, Edit, Plus, Save } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function AdminPacksTab({ cards }: { cards: Card[] }) {
  const [packs, setPacks] = useState<CardPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState(100);
  const [cardsPerPack, setCardsPerPack] = useState(1);
  const [packCards, setPackCards] = useState<CardPackItem[]>([]);

  const fetchPacks = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'cardPacks'));
      const fetched: CardPack[] = [];
      snap.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as CardPack);
      });
      setPacks(fetched);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const resetForm = () => {
    setIsEditing(null);
    setName('');
    setImageUrl('');
    setPrice(100);
    setCardsPerPack(1);
    setPackCards([]);
  };

  const handleEdit = (pack: CardPack) => {
    setIsEditing(pack.id);
    setName(pack.name);
    setImageUrl(pack.imageUrl);
    setPrice(pack.price);
    setCardsPerPack(pack.cardsPerPack || 1);
    setPackCards(pack.cards || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este pacote?')) return;
    try {
      await deleteDoc(doc(db, 'cardPacks', id));
      fetchPacks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || packCards.length === 0) return console.log('Preencha o nome e adicione cartas!');

    const newId = isEditing || uuidv4();
    const newPack: CardPack = {
      id: newId,
      name,
      imageUrl,
      price,
      cardsPerPack,
      cards: packCards
    };

    try {
      await setDoc(doc(db, 'cardPacks', newId), newPack);
      fetchPacks();
      resetForm();
    } catch (e) {
      console.error(e);
      console.log('Erro ao salvar pacote');
    }
  };

  const addCardToPack = (cardId: string) => {
    if (!packCards.find(c => c.cardId === cardId)) {
      setPackCards([...packCards, { cardId, weight: 10 }]);
    }
  };

  const removeCardFromPack = (cardId: string) => {
    setPackCards(packCards.filter(c => c.cardId !== cardId));
  };

  const updateCardWeight = (cardId: string, weight: number) => {
    setPackCards(packCards.map(c => c.cardId === cardId ? { ...c, weight } : c));
  };

  if (loading) return <div className="text-white">Carregando pacotes...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-[#d4c3a1]">
      <div className="lg:col-span-1 bg-[#1a1814] p-4 sm:p-6 border border-[#3d3326] rounded-md shadow-2xl h-fit">
        <h2 className="text-lg font-bold uppercase tracking-widest text-[#a67c52] mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {isEditing ? 'Editar Pacote' : 'Novo Pacote'}
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">URL da Imagem</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Preço (C$)</label>
              <input type="number" min="0" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Cartas por Pacote</label>
              <input type="number" min="1" value={cardsPerPack} onChange={e => setCardsPerPack(Number(e.target.value))} required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
          </div>
          
          <div className="mt-4 border-t border-[#3d3326] pt-4">
            <h3 className="text-sm font-bold uppercase mb-2">Cartas no Pacote</h3>
            <p className="text-[10px] text-gray-500 mb-2">Peso maior = mais fácil de cair. Peso 10 = comum, 1 = raro.</p>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 no-scrollbar">
               {packCards.map(pc => {
                 const cardInfo = cards.find(c => c.id === pc.cardId);
                 return (
                   <div key={pc.cardId} className="flex items-center gap-2 bg-[#0f0e0c] p-2 rounded border border-[#3d3326]">
                      <span className="text-xs truncate flex-1">{cardInfo?.name || pc.cardId}</span>
                      <input 
                         type="number" min="1" 
                         className="w-16 bg-black border border-[#3d3326] text-xs p-1 rounded" 
                         value={pc.weight} 
                         onChange={(e) => updateCardWeight(pc.cardId, Number(e.target.value))}
                         title="Peso"
                      />
                      <button type="button" onClick={() => removeCardFromPack(pc.cardId)} className="text-red-500 hover:bg-red-900/30 p-1 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                   </div>
                 );
               })}
            </div>
          </div>

          <div className="mt-4 border-t border-[#3d3326] pt-4">
             <h3 className="text-sm font-bold uppercase mb-2">Adicionar Cartas</h3>
             <select 
               className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52] mb-2"
               onChange={(e) => { if(e.target.value) addCardToPack(e.target.value); e.target.value = ""; }}
               defaultValue=""
             >
                <option value="" disabled>Selecione uma carta para adicionar</option>
                {cards.map(c => (
                   <option key={c.id} value={c.id} disabled={packCards.some(pc => pc.cardId === c.id)}>{c.name} ({c.type})</option>
                ))}
             </select>
          </div>

          <div className="flex gap-2 pt-4">
            {isEditing && (
              <button type="button" onClick={resetForm} className="flex-1 bg-[#3d3326] hover:bg-[#4a3e2f] py-2 rounded text-xs font-bold uppercase transition-colors">
                Cancelar
              </button>
            )}
            <button type="submit" className="flex-1 bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2">
              <Save className="w-4 h-4" />
              {isEditing ? 'Atualizar' : 'Criar Pacote'}
            </button>
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-[#e2b17a] border-b border-[#3d3326] pb-2">Pacotes Existentes ({packs.length})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {packs.map(pack => (
             <div key={pack.id} className="bg-[#1a1814] border border-[#3d3326] p-4 rounded flex flex-col gap-3">
                <div className="flex justify-between items-start">
                   <div>
                     <h3 className="font-bold text-[#a67c52] text-lg uppercase">{pack.name}</h3>
                     <div className="text-xs text-[#d4c3a1]/60 font-bold mt-1">C$ {pack.price}</div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => handleEdit(pack)} className="p-2 bg-blue-900/30 text-blue-400 hover:bg-blue-900/60 rounded">
                       <Edit className="w-4 h-4" />
                     </button>
                     <button onClick={() => handleDelete(pack.id)} className="p-2 bg-red-900/30 text-red-500 hover:bg-red-900/60 rounded">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
                {pack.imageUrl && (
                   <img src={pack.imageUrl} alt={pack.name} className="w-full h-32 object-cover rounded border border-[#3d3326]" />
                )}
                <div className="text-xs text-gray-400 mt-2">
                   Cartas no pacote: {pack.cards?.length || 0}
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
