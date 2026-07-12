const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  "import { CardModal } from '../components/CardModal';",
  "import { CardModal } from '../components/CardModal';\nimport { AudioSettingsModal } from '../components/AudioSettingsModal';\nimport { useAudio } from '../contexts/AudioContext';"
);

code = code.replace(
  "import { ArrowLeft, Flag, Check, UserPlus, Eye, Swords, X, MessageSquare } from 'lucide-react';",
  "import { ArrowLeft, Flag, Check, UserPlus, Eye, Swords, X, MessageSquare, Volume2 } from 'lucide-react';"
);

code = code.replace(
  "const [isChatOpen, setIsChatOpen] = useState(false);",
  "const [isChatOpen, setIsChatOpen] = useState(false);\n  const [showAudioSettings, setShowAudioSettings] = useState(false);"
);

if (!code.includes('setCurrentTrack')) {
  code = code.replace(
    "const { currentUser, userData } = useAuth();",
    "const { currentUser, userData } = useAuth();\n  const { setCurrentTrack, config } = useAudio();\n\n  useEffect(() => {\n    if (gameState?.isBotMatch) {\n        // Just default battleMusic for bot matches\n        if (config.battleMusic) setCurrentTrack(config.battleMusic);\n    } else {\n        if (config.battleMusic) setCurrentTrack(config.battleMusic);\n    }\n    return () => setCurrentTrack(null);\n  }, [config.battleMusic, setCurrentTrack, gameState?.isBotMatch]);"
  );
}

code = code.replace(
  /<button onClick=\{\(\) => setIsChatOpen\(!isChatOpen\)\}/,
  `<button onClick={() => setShowAudioSettings(true)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto">
                 <Volume2 className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Áudio</span>
              </button>
              <button onClick={() => setIsChatOpen(!isChatOpen)}`
);

code = code.replace(
  /\{showCardModal && selectedCard && \(/,
  `{showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}
      {showCardModal && selectedCard && (`
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed GameBoard audio');
