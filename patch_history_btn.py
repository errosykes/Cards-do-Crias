import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <UserIcon className="w-4 h-4" /> Perfil
          </button>"""

replacement = """          <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <Trophy className="w-4 h-4" /> Histórico
          </button>
          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <UserIcon className="w-4 h-4" /> Perfil
          </button>"""

if "Histórico" not in content:
    content = content.replace(target, replacement)

target_import = "import { Play, Search, LogOut, Plus, Sword, Users, ShieldAlert, ArrowRight, User as UserIcon, BookOpen, Settings, Edit2, Check, Eye } from 'lucide-react';"
replacement_import = "import { Play, Search, LogOut, Plus, Sword, Users, ShieldAlert, ArrowRight, User as UserIcon, BookOpen, Settings, Edit2, Check, Eye, Trophy } from 'lucide-react';"
if "Trophy" not in target_import and "Trophy" not in content[:500]:
    content = content.replace(target_import, replacement_import)

target_modal = """      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}"""
replacement_modal = """      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}
      {showHistoryModal && userData && (
        <HistoryModal userData={userData} onClose={() => setShowHistoryModal(false)} />
      )}"""

if "HistoryModal userData" not in content:
    content = content.replace(target_modal, replacement_modal)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
