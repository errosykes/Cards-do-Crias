const fs = require('fs');

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
dash = dash.replace(
  'const { setCurrentTrack, config } = useAudio();',
  'const { setCurrentPlaylist, config } = useAudio();'
);
dash = dash.replace(
  'if (config.menuMusic) {\n      setCurrentTrack(config.menuMusic);\n    } else {\n      setCurrentTrack(null);\n    }\n  }, [config.menuMusic, setCurrentTrack]);',
  'if (config.menuMusic && config.menuMusic.length > 0) {\n      setCurrentPlaylist(config.menuMusic);\n    } else {\n      setCurrentPlaylist(null);\n    }\n  }, [config.menuMusic, setCurrentPlaylist]);'
);
fs.writeFileSync('src/pages/Dashboard.tsx', dash);

let game = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');
game = game.replace(
  'const { setCurrentTrack, config } = useAudio();',
  'const { setCurrentPlaylist, config } = useAudio();'
);
game = game.replace(
  'useEffect(() => {\n    if (gameState?.isBotMatch && gameState?.campaignId && config.campaignMusic?.[gameState.campaignId]) {\n      setCurrentTrack(config.campaignMusic[gameState.campaignId]);\n    } else if (config.battleMusic) {\n      setCurrentTrack(config.battleMusic);\n    }\n    return () => setCurrentTrack(null);\n  }, [config.battleMusic, setCurrentTrack, gameState?.isBotMatch, gameState?.campaignId, config.campaignMusic]);',
  'useEffect(() => {\n    if (gameState?.isBotMatch && gameState?.campaignId && config.campaignMusic?.[gameState.campaignId] && config.campaignMusic[gameState.campaignId].length > 0) {\n      setCurrentPlaylist(config.campaignMusic[gameState.campaignId]);\n    } else if (config.battleMusic && config.battleMusic.length > 0) {\n      setCurrentPlaylist(config.battleMusic);\n    }\n    return () => setCurrentPlaylist(null);\n  }, [config.battleMusic, setCurrentPlaylist, gameState?.isBotMatch, gameState?.campaignId, config.campaignMusic]);'
);
fs.writeFileSync('src/pages/GameBoard.tsx', game);

let admin = fs.readFileSync('src/components/AdminAudioTab.tsx', 'utf-8');
admin = admin.replace(
  `            setMenuMusic(data.menuMusic || '');
            setBattleMusic(data.battleMusic || '');
            setCampaignMusic(data.campaignMusic || {});`,
  `            setMenuMusic(Array.isArray(data.menuMusic) ? data.menuMusic.join('\\n') : (data.menuMusic || ''));
            setBattleMusic(Array.isArray(data.battleMusic) ? data.battleMusic.join('\\n') : (data.battleMusic || ''));
            
            const campMap: Record<string, string> = {};
            if (data.campaignMusic) {
                Object.keys(data.campaignMusic).forEach(k => {
                    const val = data.campaignMusic[k];
                    campMap[k] = Array.isArray(val) ? val.join('\\n') : (val || '');
                });
            }
            setCampaignMusic(campMap);`
);

admin = admin.replace(
  `      await setDoc(doc(db, 'settings', 'audio'), {
        menuMusic,
        battleMusic,
        campaignMusic
      }, { merge: true });`,
  `      const menuArr = menuMusic.split('\\n').map(s => s.trim()).filter(Boolean);
      const battleArr = battleMusic.split('\\n').map(s => s.trim()).filter(Boolean);
      const campMap: Record<string, string[]> = {};
      Object.keys(campaignMusic).forEach(k => {
         const arr = campaignMusic[k].split('\\n').map(s => s.trim()).filter(Boolean);
         if (arr.length > 0) {
             campMap[k] = arr;
         }
      });
      await setDoc(doc(db, 'settings', 'audio'), {
        menuMusic: menuArr,
        battleMusic: battleArr,
        campaignMusic: campMap
      }, { merge: true });`
);

admin = admin.replace(
  `          <label className="block text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-2">Música do Menu (URL)</label>
          <input 
            type="url" 
            value={menuMusic}
            onChange={e => setMenuMusic(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-3 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1]"
            placeholder="Ex: https://example.com/menu-music.mp3"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Atenção: O link deve ser direto para um arquivo de áudio (ex: .mp3). Links de páginas como YouTube ou SoundCloud não funcionarão.</p>`,
  `          <label className="block text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-2">Playlist do Menu (URLs, uma por linha)</label>
          <textarea 
            value={menuMusic}
            onChange={e => setMenuMusic(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-3 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1] min-h-[100px]"
            placeholder="Ex:&#10;https://example.com/menu-music1.mp3&#10;https://example.com/menu-music2.mp3"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">Atenção: O link deve ser direto para um arquivo de áudio (ex: .mp3). Links de páginas como YouTube ou SoundCloud não funcionarão. Coloque uma URL por linha para criar uma playlist.</p>`
);

admin = admin.replace(
  `          <label className="block text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-2">Música de Batalha Padrão (URL)</label>
          <input 
            type="url" 
            value={battleMusic}
            onChange={e => setBattleMusic(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-3 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1]"
            placeholder="Ex: https://example.com/battle-music.mp3"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">O link deve ser direto para um arquivo de áudio (ex: .mp3).</p>`,
  `          <label className="block text-sm font-bold tracking-tighter text-[#a67c52] uppercase mb-2">Playlist de Batalha Padrão (URLs, uma por linha)</label>
          <textarea 
            value={battleMusic}
            onChange={e => setBattleMusic(e.target.value)}
            className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-3 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1] min-h-[100px]"
            placeholder="Ex:&#10;https://example.com/battle-music1.mp3&#10;https://example.com/battle-music2.mp3"
          />
          <p className="text-[10px] text-gray-500 mt-1 uppercase">O link deve ser direto para um arquivo de áudio (ex: .mp3). Coloque uma URL por linha.</p>`
);

admin = admin.replace(
  `                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">[{camp.type}] {camp.title}</label>
                    <input 
                      type="url" 
                      value={campaignMusic[camp.id] || ''}
                      onChange={e => setCampaignMusic({ ...campaignMusic, [camp.id]: e.target.value })}
                      className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1]"
                      placeholder="Deixe em branco para usar a padrão..."
                    />`,
  `                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1">[{camp.type}] {camp.title}</label>
                    <textarea 
                      value={campaignMusic[camp.id] || ''}
                      onChange={e => setCampaignMusic({ ...campaignMusic, [camp.id]: e.target.value })}
                      className="w-full bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm focus:outline-none focus:border-[#a67c52] text-[#d4c3a1] min-h-[80px]"
                      placeholder="Deixe em branco para usar a padrão..."
                    />`
);

fs.writeFileSync('src/components/AdminAudioTab.tsx', admin);
console.log('Fixed pages and admin for playlists');
