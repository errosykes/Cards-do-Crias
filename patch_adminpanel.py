import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

import_target = "import { CardModal } from '../components/CardModal';"
import_replacement = "import { CardModal } from '../components/CardModal';\nimport { AdminPacksTab } from '../components/AdminPacksTab';\nimport { Package } from 'lucide-react';"
content = content.replace(import_target, import_replacement)

state_target = "  const [activeTab, setActiveTab] = useState<'cards' | 'players' | 'logs'>('cards');"
state_replacement = "  const [activeTab, setActiveTab] = useState<'cards' | 'players' | 'logs' | 'packs'>('cards');"
content = content.replace(state_target, state_replacement)

tab_btn_target = """          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'logs' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Activity className="w-4 h-4" />
            Logs de Atividade
          </button>
        </div>"""

tab_btn_replacement = """          <button 
            onClick={() => setActiveTab('logs')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'logs' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Activity className="w-4 h-4" />
            Logs de Atividade
          </button>
          <button 
            onClick={() => setActiveTab('packs')} 
            className={`px-4 py-2 text-xs font-bold uppercase rounded flex items-center gap-2 transition-colors ${activeTab === 'packs' ? 'bg-[#3d3326] text-[#e2b17a]' : 'text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
          >
            <Package className="w-4 h-4" />
            Pacotes (Loja)
          </button>
        </div>"""
content = content.replace(tab_btn_target, tab_btn_replacement)

content = content.replace(
    ": activeTab === 'players' ? (",
    ": activeTab === 'packs' ? (\n        <AdminPacksTab cards={cards} />\n      ) : activeTab === 'players' ? ("
)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)
print("done")
