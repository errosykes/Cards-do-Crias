const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf-8');

if (!code.includes("setActiveTab('audio')")) {
  code = code.replace(
    "export default function AdminPanel() {",
    "import { AdminAudioTab } from '../components/AdminAudioTab';\nimport { Music } from 'lucide-react';\n\nexport default function AdminPanel() {"
  );

  code = code.replace(
    "const [activeTab, setActiveTab] = useState<'cards' | 'players' | 'logs' | 'packs' | 'rewards' | 'tournament'>('cards');",
    "const [activeTab, setActiveTab] = useState<'cards' | 'players' | 'logs' | 'packs' | 'rewards' | 'campaigns' | 'audio'>('cards');"
  );

  code = code.replace(
    "          <button \n            onClick={() => setActiveTab('campaigns')}",
    `          <button \n            onClick={() => setActiveTab('audio')} \n            className={\`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors \${activeTab === 'audio' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}\`}\n          >\n            <Music className="w-4 h-4" />\n            Áudio\n          </button>\n          <button \n            onClick={() => setActiveTab('campaigns')}`
  );

  code = code.replace(
    ") : activeTab === 'logs' ? (",
    ") : activeTab === 'audio' ? (\n        <AdminAudioTab />\n      ) : activeTab === 'logs' ? ("
  );
}

fs.writeFileSync('src/pages/AdminPanel.tsx', code);
console.log('Fixed');
