import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';

export function AdminAudioTab() {
  const [menuMusic, setMenuMusic] = useState('');
  const [battleMusic, setBattleMusic] = useState('');
  const [campaignMusic, setCampaignMusic] = useState<Record<string, string>>({});
  
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCamps = async () => {
      const snap = await getDocs(collection(db, 'campaigns'));
      setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchCamps();

    const unsub = onSnapshot(doc(db, 'settings', 'audio'), (d) => {
        if (d.exists()) {
            const data = d.data();
            setMenuMusic(Array.isArray(data.menuMusic) ? data.menuMusic.join('\n') : (data.menuMusic || ''));
            setBattleMusic(Array.isArray(data.battleMusic) ? data.battleMusic.join('\n') : (data.battleMusic || ''));
            
            const campMap: Record<string, string> = {};
            if (data.campaignMusic) {
                Object.keys(data.campaignMusic).forEach(k => {
                    const val = data.campaignMusic[k];
                    campMap[k] = Array.isArray(val) ? val.join('\n') : (val || '');
                });
            }
            setCampaignMusic(campMap);
        }
        setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const menuArr = menuMusic.split('\n').map(s => s.trim()).filter(Boolean);
      const battleArr = battleMusic.split('\n').map(s => s.trim()).filter(Boolean);
      const campMap: Record<string, string[]> = {};
      Object.keys(campaignMusic).forEach(k => {
         const arr = campaignMusic[k].split('\n').map(s => s.trim()).filter(Boolean);
         if (arr.length > 0) {
             campMap[k] = arr;
         }
      });
      await setDoc(doc(db, 'settings', 'audio'), {
        menuMusic: menuArr,
        battleMusic: battleArr,
        campaignMusic: campMap
      }, { merge: true });
      alert('Configurações salvas!');
    } catch(err) {
      console.error(err);
      alert('Erro ao salvar.');
    }
    setSaving(false);
  };

  if (loading) return <div className="text-white">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4 border-b border-[#3d3326] pb-2">
        <h2 className="text-xl font-black uppercase text-[#e2b17a]">Configurações de Áudio</h2>
      </div>
      
      <form onSubmit={handleSave} className="bg-[#141210] border border-[#3d3326] rounded p-6 shadow-2xl max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-2">Playlist do Menu (URLs, uma por linha)</label>
          <textarea 
            value={menuMusic}
            onChange={e => setMenuMusic(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-3 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1] min-h-[100px]"
            placeholder="Ex:&#10;https://example.com/menu-music1.mp3&#10;https://example.com/menu-music2.mp3"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Atenção: O link deve ser direto para um arquivo de áudio (ex: .mp3). Links de páginas como YouTube ou SoundCloud não funcionarão. Coloque uma URL por linha para criar uma playlist.</p>
        </div>
        
        <div>
          <label className="block text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-2">Playlist de Batalha Padrão (URLs, uma por linha)</label>
          <textarea 
            value={battleMusic}
            onChange={e => setBattleMusic(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-3 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1] min-h-[100px]"
            placeholder="Ex:&#10;https://example.com/battle-music1.mp3&#10;https://example.com/battle-music2.mp3"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">O link deve ser direto para um arquivo de áudio (ex: .mp3). Coloque uma URL por linha.</p>
        </div>

        <div className="border-t border-[#3d3326] pt-6">
           <h3 className="text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-4">Músicas Específicas por Campanha/Torneio</h3>
           <div className="space-y-4">
              {campaigns.map(camp => (
                 <div key={camp.id}>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">[{camp.type}] {camp.title}</label>
                    <textarea 
                      value={campaignMusic[camp.id] || ''}
                      onChange={e => setCampaignMusic({ ...campaignMusic, [camp.id]: e.target.value })}
                      className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1] min-h-[80px]"
                      placeholder="Deixe em branco para usar a padrão..."
                    />
                 </div>
              ))}
           </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] text-black py-3 px-6 rounded font-bold uppercase transition-colors disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
}
