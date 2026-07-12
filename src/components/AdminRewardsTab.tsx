import React from "react";
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { RewardsConfig } from '../types';
import { Save } from 'lucide-react';

export function AdminRewardsTab() {
  const [config, setConfig] = useState<RewardsConfig>({
    botWin: 20, botDraw: 5, botLoss: 5,
    pvpWin: 50, pvpDraw: 20, pvpLoss: 10,
    tournamentWin: 100, tournamentDraw: 0, tournamentLoss: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const d = await getDoc(doc(db, 'system', 'rewards'));
        if (d.exists()) {
          setConfig({ ...config, ...d.data() } as RewardsConfig);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({
      ...config,
      [e.target.name]: Number(e.target.value)
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'system', 'rewards'), config);
      console.log('Configurações salvas com sucesso!');
    } catch (err) {
      console.error(err);
      console.log('Erro ao salvar configurações.');
    }
  };

  if (loading) return <div className="text-[#d4c3a1]">Carregando...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-black uppercase text-[#e2b17a] mb-4">Configurações de Recompensas (Cruzeiros C$)</h2>
      
      <form onSubmit={handleSave} className="bg-[#1a1814] p-6 rounded-lg border border-[#3d3326] space-y-6 max-w-2xl">
        <div>
          <h3 className="text-lg font-bold text-[#a67c52] uppercase mb-3 border-b border-[#3d3326] pb-2">Batalhas vs Bot (Treino/Normal/Difícil)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Vitória</label>
              <input type="number" name="botWin" value={config.botWin} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Empate</label>
              <input type="number" name="botDraw" value={config.botDraw} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Derrota</label>
              <input type="number" name="botLoss" value={config.botLoss} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#a67c52] uppercase mb-3 border-b border-[#3d3326] pb-2">Batalhas PvP (Jogadores)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Vitória</label>
              <input type="number" name="pvpWin" value={config.pvpWin} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Empate</label>
              <input type="number" name="pvpDraw" value={config.pvpDraw} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Derrota</label>
              <input type="number" name="pvpLoss" value={config.pvpLoss} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#a67c52] uppercase mb-3 border-b border-[#3d3326] pb-2">Torneio</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Vitória</label>
              <input type="number" name="tournamentWin" value={config.tournamentWin} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Empate</label>
              <input type="number" name="tournamentDraw" value={config.tournamentDraw} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-gray-400 mb-1">Derrota</label>
              <input type="number" name="tournamentLoss" value={config.tournamentLoss} onChange={handleChange} min="0" required className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52]" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black py-3 rounded font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(166,124,82,0.4)] mt-4">
          <Save className="w-5 h-5" />
          Salvar Configurações
        </button>
      </form>
    </div>
  );
}
