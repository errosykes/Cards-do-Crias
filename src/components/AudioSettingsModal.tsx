import React from 'react';
import { useAudio } from '../contexts/AudioContext';
import { Volume2, VolumeX, X, Music, Volume1 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function AudioSettingsModal({ onClose }: Props) {
  const { musicVolume, setMusicVolume, sfxVolume, setSfxVolume } = useAudio();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#1a1814] border border-[#a67c52] rounded shadow-[0_0_50px_rgba(166,124,82,0.2)] w-full max-w-sm flex flex-col font-serif relative" onClick={e => e.stopPropagation()}>
        
        <div className="flex justify-between items-center p-4 border-b border-[#3d3326]">
          <h2 className="text-xl font-bold tracking-widest text-[#e2b17a] uppercase flex items-center gap-2">
            <Volume2 className="w-5 h-5" /> Áudio
          </h2>
          <button onClick={onClose} className="text-[#d4c3a1]/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold uppercase text-[#d4c3a1] flex items-center gap-2">
                <Music className="w-4 h-4 text-[#a67c52]" /> Música
              </label>
              <span className="text-xs text-[#a67c52] font-bold">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={musicVolume} 
              onChange={e => setMusicVolume(parseFloat(e.target.value))}
              className="w-full accent-[#a67c52] h-2 bg-[#0f0e0c] rounded-lg appearance-none cursor-pointer border border-[#3d3326]"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold uppercase text-[#d4c3a1] flex items-center gap-2">
                <Volume1 className="w-4 h-4 text-[#a67c52]" /> Efeitos (SFX)
              </label>
              <span className="text-xs text-[#a67c52] font-bold">{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={sfxVolume} 
              onChange={e => setSfxVolume(parseFloat(e.target.value))}
              className="w-full accent-[#a67c52] h-2 bg-[#0f0e0c] rounded-lg appearance-none cursor-pointer border border-[#3d3326]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-[#3d3326] flex justify-end">
          <button 
            onClick={onClose}
            className="bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-black py-2 px-6 rounded text-sm font-bold uppercase transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
