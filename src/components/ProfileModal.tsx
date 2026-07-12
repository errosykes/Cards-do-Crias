import React, { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, UserProfile } from '../types';

interface Props {
  userData: User;
  onClose: () => void;
}

export function ProfileModal({ userData, onClose }: Props) {
  const [font, setFont] = useState(userData.profile?.font || 'font-sans');
  const [color, setColor] = useState(userData.profile?.color || '#a67c52');
  const [avatarUrl, setAvatarUrl] = useState(userData.profile?.avatarUrl || '');
  const [coverUrl, setCoverUrl] = useState(userData.profile?.coverUrl || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        'profile': {
          font,
          color,
          avatarUrl,
          coverUrl
        }
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-serif">
      <div className="bg-[#1a1814] border-2 border-[#3d3326] p-6 rounded-md w-full max-w-md text-[#d4c3a1] shadow-2xl space-y-4 relative">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e2b17a] mb-6 text-center border-b border-[#3d3326] pb-2">Personalizar Perfil</h2>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Foto de Perfil (URL)</label>
            <input 
              type="text" 
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Foto de Capa (URL)</label>
            <p className="text-[10px] text-[#d4c3a1]/60 mb-1">Tamanho ideal: 600x200 pixels (Proporção 3:1)</p>
            <input 
              type="text" 
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] transition-colors"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Cor do Nome</label>
            <div className="flex gap-2">
               <input 
                 type="color" 
                 value={color}
                 onChange={(e) => setColor(e.target.value)}
                 className="w-10 h-10 bg-transparent cursor-pointer rounded"
               />
               <input 
                  type="text" 
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] transition-colors uppercase"
               />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[#a67c52] mb-1">Fonte do Nome</label>
            <select 
              value={font}
              onChange={(e) => setFont(e.target.value)}
              className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] transition-colors"
            >
              <option value="font-sans">Sans-serif (Padrão)</option>
              <option value="font-serif">Serif</option>
              <option value="font-mono">Monospace</option>
            </select>
          </div>

          <div 
            className="mt-6 p-6 border border-[#3d3326] rounded bg-[#0f0e0c] flex items-center gap-4 relative overflow-hidden h-32"
          >
             {coverUrl && (
                <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-50 z-0" />
             )}
             <div className="relative z-10 flex items-center gap-4 w-full">
                 {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full border-2 border-[#a67c52] object-cover shadow-lg" />
                 ) : (
                    <div className="w-16 h-16 rounded-full bg-[#3d3326] border-2 border-[#a67c52] flex items-center justify-center font-bold shadow-lg text-lg">?</div>
                 )}
                 <span className={`${font} drop-shadow-md`} style={{ color: color, fontWeight: 'bold', fontSize: '1.5rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>{userData.username}</span>
             </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#a67c52] mb-4 border-b border-[#3d3326] pb-1">Histórico de Partidas</h3>
            {(!userData.matchHistory || userData.matchHistory.length === 0) ? (
              <p className="text-[#d4c3a1]/50 text-xs italic">Nenhuma partida registrada ainda.</p>
            ) : (
              <div className="space-y-2">
                {userData.matchHistory.map((match, idx) => (
                  <div key={idx} className="bg-[#0f0e0c] border border-[#3d3326] p-3 rounded flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[#d4c3a1]/50">{new Date(match.date).toLocaleDateString()}</div>
                      <div className="text-sm font-bold uppercase mt-1">vs {match.opponentName}</div>
                    </div>
                    <div className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                      match.result === 'win' ? 'bg-green-950/30 text-green-500 border border-green-900/50' :
                      match.result === 'loss' ? 'bg-red-950/30 text-red-500 border border-red-900/50' :
                      'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}>
                      {match.result === 'win' ? 'Vitória' : match.result === 'loss' ? 'Derrota' : 'Empate'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#3d3326]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[#a67c52] uppercase font-bold text-xs hover:bg-[#3d3326] rounded transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#a67c52] text-[#0f0e0c] uppercase font-bold text-xs rounded hover:bg-[#e2b17a] transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}
