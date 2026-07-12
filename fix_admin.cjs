const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf-8');

code = code.replace(
  'import { AdminCampaignsTab } from "../components/AdminCampaignsTab";',
  'import { AdminCampaignsTab } from "../components/AdminCampaignsTab";\nimport { AdminAudioTab } from "../components/AdminAudioTab";\nimport { Music } from "lucide-react";'
);

code = code.replace(
  /<button\n\s*onClick=\{\(\) => setActiveTab\('campaigns'\)\}/,
  `<button 
              onClick={() => setActiveTab('audio')}
              className={\`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors \${activeTab === 'audio' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}\`}
            >
              <Music className="w-4 h-4" /> Áudio
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}`
);

code = code.replace(
  /\) : activeTab === 'logs' \? \(/,
  `) : activeTab === 'audio' ? (
          <AdminAudioTab />
      ) : activeTab === 'logs' ? (`
);

fs.writeFileSync('src/pages/AdminPanel.tsx', code);
console.log('Fixed AdminPanel audio tab');
