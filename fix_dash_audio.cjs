const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

if (!code.includes('AudioSettingsModal')) {
    code = code.replace(
      "import { CardModal } from '../components/CardModal';",
      "import { CardModal } from '../components/CardModal';\nimport { AudioSettingsModal } from '../components/AudioSettingsModal';\nimport { useAudio } from '../contexts/AudioContext';"
    );
}

if (!code.includes('setShowAudioSettings')) {
    code = code.replace(
      'const [showCardModal, setShowCardModal] = useState(false);',
      'const [showCardModal, setShowCardModal] = useState(false);\n  const [showAudioSettings, setShowAudioSettings] = useState(false);'
    );
}

if (!code.includes('Volume2')) {
    code = code.replace(
        "import { Store as StoreIcon, ShieldAlert, Plus, Play, LogOut, Edit2, Check, User as UserIcon, Users, Eye, Trophy } from 'lucide-react';",
        "import { Store as StoreIcon, ShieldAlert, Plus, Play, LogOut, Edit2, Check, User as UserIcon, Users, Eye, Trophy, Volume2 } from 'lucide-react';"
    );
}

code = code.replace(
  '<button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">',
  `<button onClick={() => setShowAudioSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <Volume2 className="w-4 h-4" /> Áudio
          </button>
          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">`
);

code = code.replace(
  '{showCardModal && selectedCard && (',
  `{showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}
      {showCardModal && selectedCard && (`
);

// Add music effect
if (!code.includes('setCurrentTrack(config.menuMusic)')) {
    code = code.replace(
        "const { currentUser, userData, logout } = useAuth();",
        "const { currentUser, userData, logout } = useAuth();\n  const { setCurrentTrack, config } = useAudio();\n\n  useEffect(() => {\n    if (config.menuMusic) {\n      setCurrentTrack(config.menuMusic);\n    } else {\n      setCurrentTrack(null);\n    }\n  }, [config.menuMusic, setCurrentTrack]);"
    );
}

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed Dashboard with audio');
