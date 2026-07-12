import { AdminPlayersTab } from "../components/AdminPlayersTab";
import React from "react";
import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { loadAllCards, getAllCachedCards } from '../lib/cardsCache';
import { db } from '../lib/firebase';
import { Card, CardType, User } from '../types';
import { Package, ArrowLeft, Plus, Trash2, Edit, Users, LayoutTemplate, Activity, Shield } from 'lucide-react';
import { Link } from "react-router-dom";
import { AdminPacksTab } from "../components/AdminPacksTab";
import { AdminRewardsTab } from "../components/AdminRewardsTab";
import { AdminCampaignsTab } from "../components/AdminCampaignsTab";
import { EFFECT_DESCRIPTIONS } from "../lib/effects";

const CARD_TYPES: CardType[] = ['Melee', 'Ranged', 'Cenário', 'Trap', 'Magic', 'Heal', 'Event'];

const PREDEFINED_EFFECTS = [
  'Espião',
  'Espião Assassino',
  'Médico',
  'Herói',
  'Comprar 1',
  'Comprar 2',
  'Queimar',
  'Impulso Moral',
  'Ladrão',
  'Dinheiro a Juros',
  'Vínculo Estreito',
  'Clima',
  'Buff de área melee',
  'Buff de área ranged',
  'Trap campo melee',
  'Trap campo Ranged',
  'BUFF DE ESPECIFICO',
  'DBUFF DE ESPECIFICO'
];

import { AdminAudioTab } from '../components/AdminAudioTab';
import { Music } from 'lucide-react';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'cards' | 'players' | 'logs' | 'packs' | 'rewards' | 'campaigns' | 'audio'>('cards');
  const [logs, setLogs] = useState<any[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CardType>('Melee');
  const [points, setPoints] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState('');
  const [backgroundUrl, setBackgroundUrl] = useState('');
  const [backImageUrl, setBackImageUrl] = useState('');
  const [effects, setEffects] = useState<string[]>([]);
  const [buffTargetNames, setBuffTargetNames] = useState<string[]>([]);
  const [debuffTargetNames, setDebuffTargetNames] = useState<string[]>([]);

  const seedCards = async () => {
    setLoading(true);
    const newCards = [
      { name: 'Geralt de Rívia', description: 'Um bruxo lendário.', type: 'Melee', points: 15, imageUrl: 'https://images.unsplash.com/photo-1598553258596-f046dc1b2123?auto=format&fit=crop&w=500&q=60', effects: ['Herói'] },
      { name: 'Ciri', description: 'A Leoa de Cintra.', type: 'Melee', points: 15, imageUrl: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&w=500&q=60', effects: ['Herói'] },
      { name: 'Yennefer', description: 'Feiticeira poderosa.', type: 'Ranged', points: 7, imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=60', effects: ['Herói', 'Médico'] },
      { name: 'Triss Merigold', description: 'Feiticeira talentosa.', type: 'Ranged', points: 7, imageUrl: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=500&q=60', effects: ['Herói'] },
      { name: 'Vesemir', description: 'O bruxo mais velho e experiente de Kaer Morhen.', type: 'Melee', points: 6, imageUrl: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?auto=format&fit=crop&w=500&q=60', effects: [] },
      { name: 'Jaskier', description: 'Um bardo famoso.', type: 'Melee', points: 2, imageUrl: 'https://images.unsplash.com/photo-1510590337019-5ef8d3d32116?auto=format&fit=crop&w=500&q=60', effects: ['Impulso Moral'] },
      { name: 'Arqueiro de Elite', description: 'Especialista em ataques à distância.', type: 'Ranged', points: 5, imageUrl: 'https://images.unsplash.com/photo-1590209635032-4e4db549e379?auto=format&fit=crop&w=500&q=60', effects: [] },
      { name: 'Espião do Império', description: 'Trabalha nas sombras.', type: 'Melee', points: 4, imageUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=500&q=60', effects: ['Espião',
  'Espião Assassino', 'Comprar 2'] },
      { name: 'Feitiço de Fogo', description: 'Queima as cartas mais fortes.', type: 'Magic', points: 0, imageUrl: 'https://images.unsplash.com/photo-1504194921103-f8b80cadd5e4?auto=format&fit=crop&w=500&q=60', effects: ['Queimar'] },
      { name: 'Inverno Rigoroso', description: 'Congela a linha de frente.', type: 'Event', points: 0, imageUrl: 'https://images.unsplash.com/photo-1478719059408-592965723cbc?auto=format&fit=crop&w=500&q=60', effects: ['Clima'] }
    ];

    for (const card of newCards) {
      await addDoc(collection(db, 'cards'), card);
    }
    
    await fetchCards(true);
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
    fetchPlayers();
    fetchLogs();
  }, []);

  const fetchCards = async (force: boolean = false) => {
    await loadAllCards(force);
    
    const cardsData = getAllCachedCards();
    setCards(cardsData);
    setLoading(false);
  };

  const fetchPlayers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersData = querySnapshot.docs.map(doc => doc.data() as User);
    setPlayers(usersData);
  };

  const fetchLogs = async () => {
    const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const resetForm = () => {
    setIsEditing(null);
    setName('');
    setDescription('');
    setType('Melee');
    setPoints(0);
    setImageUrl('');
    setBackgroundUrl('');
    setBackImageUrl('');
    setEffects([]);
    setBuffTargetNames([]);
    setDebuffTargetNames([]);
  };

  const handleEdit = (card: Card) => {
    setIsEditing(card.id);
    setName(card.name);
    setDescription(card.description);
    setType(card.type);
    setPoints(card.points);
    setImageUrl(card.imageUrl);
    setBackgroundUrl(card.backgroundUrl || '');
    setBackImageUrl(card.backImageUrl || '');
    setEffects(card.effects || []);
    setBuffTargetNames(card.buffTargetNames || (card.buffTargetName ? [card.buffTargetName] : []));
    setDebuffTargetNames(card.debuffTargetNames || (card.debuffTargetName ? [card.debuffTargetName] : []));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza?')) return;
    await deleteDoc(doc(db, 'cards', id));
    fetchCards(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData = {
      name,
      description,
      type,
      points,
      imageUrl,
      backgroundUrl,
      backImageUrl,
      effects,
      buffTargetNames,
      debuffTargetNames
    };

    if (isEditing) {
      await updateDoc(doc(db, 'cards', isEditing), cardData);
    } else {
      await addDoc(collection(db, 'cards'), cardData);
    }
    
    resetForm();
    fetchCards(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 font-sans h-full overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="p-2 bg-[#1a1814] rounded border border-[#3d3326] hover:bg-[#3d3326] text-[#a67c52] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tighter text-[#a67c52] uppercase">Forja de Cartas & Jogadores</h1>
          <p className="text-[10px] opacity-50 font-sans tracking-widest uppercase">Painel Admin Master</p>
        </div>
        <div className="flex gap-2 bg-[#1a1814] p-1 border border-[#3d3326] rounded">
          <button 
            onClick={() => setActiveTab('cards')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'cards' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Cartas
          </button>
          <button 
            onClick={() => setActiveTab('players')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'players' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Users className="w-4 h-4" />
            Jogadores
          </button>
          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'logs' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Activity className="w-4 h-4" />
            Logs de Atividade
          </button>
          <button 
            onClick={() => setActiveTab('packs')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'packs' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Package className="w-4 h-4" />
            Pacotes (Loja)
          </button>
          <button 
            onClick={() => setActiveTab('rewards')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'rewards' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Activity className="w-4 h-4" />
            Recompensas
          </button>
          <button 
            onClick={() => setActiveTab('audio')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'audio' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Music className="w-4 h-4" />
            Áudio
          </button>
          <button 
            onClick={() => setActiveTab('campaigns')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'campaigns' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Shield className="w-4 h-4" />
            Torneios
          </button>
        </div>
      </div>

      {activeTab === 'cards' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-[#141210] border border-[#3d3326] rounded p-6 lg:col-span-1 h-fit shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold tracking-tighter text-[#a67c52] uppercase">{isEditing ? 'Editar Carta' : 'Criar Nova Carta'}</h2>
            {!isEditing && (
              <button 
                onClick={seedCards}
                className="bg-[#3d3326] hover:bg-[#a67c52]/50 text-[#d4c3a1] px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors"
              >
                Gerar 10 Cartas
              </button>
            )}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Tipo</label>
                <select value={type} onChange={e => setType(e.target.value as CardType)} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]">
                  {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Poder</label>
                <input type="number" value={points} onChange={e => setPoints(Number(e.target.value))} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Descrição</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-xs italic text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">URL da Imagem</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" placeholder="https://..." />
            </div>
            
            {(effects.includes('Buff de área ranged') || effects.includes('Buff de área melee') || effects.includes('Trap campo Ranged') || effects.includes('Trap campo melee') || effects.includes('BUFF DE ESPECIFICO') || effects.includes('DBUFF DE ESPECIFICO')) && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">URL do Papel de Parede (Opcional - Efeito de Campo)</label>
                <input type="url" value={backgroundUrl} onChange={e => setBackgroundUrl(e.target.value)} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" placeholder="https://..." />
              </div>
            )}
            
            {type === 'Trap' && (
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">URL da parte de trás da carta (Trap)</label>
                <input type="url" value={backImageUrl} onChange={e => setBackImageUrl(e.target.value)} className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]" placeholder="https://..." />
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#a67c52] mb-1">Efeitos</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                {PREDEFINED_EFFECTS.map(effect => (
                  <div key={effect} className="flex flex-col gap-1">
                    <label className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                      <input 
                        type="checkbox" 
                        checked={effects.includes(effect)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEffects([...effects, effect]);
                          } else {
                            setEffects(effects.filter(ef => ef !== effect));
                          }
                        }}
                        className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                      />
                      {effect}
                    </label>
                    <span className="text-[9px] text-[#d4c3a1]/50 italic pl-6">{EFFECT_DESCRIPTIONS[effect]}</span>
                  </div>
                ))}
              </div>
            </div>
            
              {effects.includes('BUFF DE ESPECIFICO') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#a67c52] uppercase tracking-widest">Cartas para Buff (+1)</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(cards.map(c => c.name))).map(name => (
                      <label key={`buff-${name}`} className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                        <input
                          type="checkbox"
                          checked={buffTargetNames.includes(name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBuffTargetNames([...buffTargetNames, name]);
                            } else {
                              setBuffTargetNames(buffTargetNames.filter(n => n !== name));
                            }
                          }}
                          className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {effects.includes('DBUFF DE ESPECIFICO') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#a67c52] uppercase tracking-widest">Cartas para Debuff (-1)</label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(cards.map(c => c.name))).map(name => (
                      <label key={`debuff-${name}`} className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                        <input
                          type="checkbox"
                          checked={debuffTargetNames.includes(name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDebuffTargetNames([...debuffTargetNames, name]);
                            } else {
                              setDebuffTargetNames(debuffTargetNames.filter(n => n !== name));
                            }
                          }}
                          className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                        />
                        {name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

            <div className="flex gap-2 mt-4">
              <button type="submit" className="flex-1 bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black py-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 border border-[#e2b17a] shadow-lg">
                {isEditing ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isEditing ? 'Salvar' : 'Criar Carta'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-4 bg-[#3d3326] hover:bg-[#a67c52]/50 text-[#d4c3a1] font-bold text-xs uppercase rounded transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Card List */}
        <div className="lg:col-span-2">
          <div className="bg-[#1a1814] border border-[#3d3326] rounded p-6 shadow-2xl">
            <h2 className="text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-4">Todas as Cartas ({cards.length})</h2>
            {loading ? (
              <div className="text-[#d4c3a1]/50 text-xs uppercase font-bold tracking-widest">Carregando cartas...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {cards.map(card => (
                  <div key={card.id} className="bg-black/40 border border-[#3d3326] rounded p-4 flex gap-4 items-start shadow-md">
                    {card.imageUrl ? (
                      <img src={card.imageUrl} referrerPolicy="no-referrer" alt={card.name} className="w-20 h-28 object-contain rounded shadow-md border border-[#3d3326] bg-black/50" />
                    ) : (
                      <div className="w-20 h-28 bg-[#3d3326] rounded border border-[#a67c52] flex items-center justify-center text-[10px] text-center font-bold text-[#d4c3a1]/50 p-2 uppercase">Sem Imagem</div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm uppercase text-[#e2b17a]">{card.name}</h3>
                          <p className="text-[10px] text-[#a67c52] font-bold uppercase mt-1">{card.type} • {card.points} Pts</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEdit(card)} className="p-1.5 text-[#d4c3a1]/60 hover:text-[#a67c52] hover:bg-[#3d3326] rounded transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(card.id)} className="p-1.5 text-[#d4c3a1]/60 hover:text-red-500 hover:bg-[#3d3326] rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#d4c3a1]/70 mt-2 line-clamp-2 italic">{card.description}</p>
                      <div className="mt-2 text-[10px] font-mono text-[#a67c52]/50 break-all bg-black/40 p-1 rounded inline-block">
                        ID: {card.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      ) : activeTab === 'packs' ? (
        <AdminPacksTab cards={cards} />
      ) : activeTab === 'rewards' ? (
        <AdminRewardsTab />
      ) : activeTab === 'campaigns' ? (
        <AdminCampaignsTab cards={cards} />
      ) : activeTab === 'players' ? (
        <AdminPlayersTab players={players} cards={cards} fetchPlayers={fetchPlayers} />
      ) : activeTab === 'audio' ? (
        <AdminAudioTab />
      ) : activeTab === 'logs' ? (
        <div className="bg-[#141210] border border-[#3d3326] rounded p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase">Registro de Atividades</h2>
            <button onClick={fetchLogs} className="text-xs text-[#d4c3a1] hover:text-[#e2b17a]">Atualizar</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#d4c3a1]">
              <thead className="bg-[#0f0e0c] uppercase text-[10px] tracking-wider text-[#a67c52]">
                <tr>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Usuário</th>
                  <th className="p-3">Ação</th>
                  <th className="p-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3d3326]/30">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#3d3326]/10 transition-colors">
                    <td className="p-3 text-[#d4c3a1]/70">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : ''}</td>
                    <td className="p-3 font-bold text-[#e2b17a]">{log.username}</td>
                    <td className="p-3">
                      <span className="bg-[#3d3326]/50 text-[#a67c52] px-2 py-0.5 rounded text-[10px] uppercase">{log.action}</span>
                    </td>
                    <td className="p-3">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <p className="text-center text-[#d4c3a1]/50 py-8 text-sm">Nenhum log encontrado.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
