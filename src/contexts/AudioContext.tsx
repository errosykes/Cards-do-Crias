import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface AudioConfig {
  menuMusic: string[];
  battleMusic: string[];
  campaignMusic: Record<string, string[]>;
}

interface AudioContextType {
  musicVolume: number;
  setMusicVolume: (v: number) => void;
  sfxVolume: number;
  setSfxVolume: (v: number) => void;
  playSfx: (url: string) => void;
  currentPlaylist: string[] | null;
  setCurrentPlaylist: (urls: string[] | null) => void;
  config: AudioConfig;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [musicVolume, setMusicVolume] = useState(() => {
    const v = localStorage.getItem('musicVolume');
    return v ? parseFloat(v) : 0.5;
  });
  
  const [sfxVolume, setSfxVolume] = useState(() => {
    const v = localStorage.getItem('sfxVolume');
    return v ? parseFloat(v) : 0.5;
  });

  const [currentPlaylist, setCurrentPlaylist] = useState<string[] | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [config, setConfig] = useState<AudioConfig>({ menuMusic: [], battleMusic: [], campaignMusic: {} });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'audio'), (d) => {
        if (d.exists()) {
            const data = d.data();
            
            // Handle both string and array formats for backward compatibility
            const menu = Array.isArray(data.menuMusic) ? data.menuMusic : (data.menuMusic ? [data.menuMusic] : []);
            const battle = Array.isArray(data.battleMusic) ? data.battleMusic : (data.battleMusic ? [data.battleMusic] : []);
            
            const camp: Record<string, string[]> = {};
            if (data.campaignMusic) {
                Object.keys(data.campaignMusic).forEach(k => {
                    const val = data.campaignMusic[k];
                    camp[k] = Array.isArray(val) ? val : (val ? [val] : []);
                });
            }

            setConfig({
                menuMusic: menu,
                battleMusic: battle,
                campaignMusic: camp
            });
        }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('musicVolume', musicVolume.toString());
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    localStorage.setItem('sfxVolume', sfxVolume.toString());
  }, [sfxVolume]);

  useEffect(() => {
    if (currentPlaylist && currentPlaylist.length > 0) {
      const trackUrl = currentPlaylist[currentTrackIndex] || currentPlaylist[0];
      
      if (!audioRef.current) {
        audioRef.current = new Audio(trackUrl);
        // Do not loop single track if playlist has more than 1 item
        audioRef.current.loop = currentPlaylist.length === 1;
        audioRef.current.onended = () => {
            if (currentPlaylist.length > 1) {
               setCurrentTrackIndex(prev => (prev + 1) % currentPlaylist.length);
            }
        };
      } else {
        if (audioRef.current.src !== trackUrl) {
            audioRef.current.src = trackUrl;
        }
        audioRef.current.loop = currentPlaylist.length === 1;
        audioRef.current.onended = () => {
            if (currentPlaylist.length > 1) {
               setCurrentTrackIndex(prev => (prev + 1) % currentPlaylist.length);
            }
        };
      }
      
      audioRef.current.volume = musicVolume;
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
            console.log('Audio autoplay blocked, requires interaction', e);
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
  }, [currentPlaylist, currentTrackIndex, musicVolume]);

  useEffect(() => {
    setCurrentTrackIndex(0);
  }, [currentPlaylist]);

  useEffect(() => {
    const handleInteraction = () => {
      if (audioRef.current && audioRef.current.paused && currentPlaylist && currentPlaylist.length > 0 && audioRef.current.src) {
        audioRef.current.play().catch(e => console.log('Still blocked', e));
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [currentPlaylist]);

  const playSfx = (url: string) => {
    if (!url) return;
    const sfx = new Audio(url);
    sfx.volume = sfxVolume;
    sfx.play().catch(e => console.log('SFX play blocked', e));
  };

  return (
    <AudioContext.Provider value={{ musicVolume, setMusicVolume, sfxVolume, setSfxVolume, playSfx, currentPlaylist, setCurrentPlaylist, config }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
