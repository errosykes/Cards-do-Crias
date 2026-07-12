import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """          <button onClick={() => setShowFriendsModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors relative">
            <Users className="w-4 h-4" /> Amigos"""

replacement = """          <Link to="/store" className="flex items-center gap-2 bg-gradient-to-r from-yellow-700 to-yellow-600 border border-yellow-500/30 text-black px-4 py-2 rounded text-xs font-bold uppercase hover:from-yellow-600 hover:to-yellow-500 transition-colors shadow-[0_0_10px_rgba(202,138,4,0.3)]">
             <StoreIcon className="w-4 h-4" /> Loja
          </Link>
          <button onClick={() => setShowFriendsModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors relative">
            <Users className="w-4 h-4" /> Amigos"""

content = content.replace(target, replacement)

import_target = "import { Play, ShieldAlert, LogOut, Check, ArrowLeft, Loader2, Info, Edit2, Swords, RefreshCw, X, MessageSquare, ArrowRightLeft, Users, Search, Target, Trophy, Clock, Skull, Zap, Droplet, User as UserIcon, HelpCircle } from 'lucide-react';"
import_replacement = "import { Play, ShieldAlert, LogOut, Check, ArrowLeft, Loader2, Info, Edit2, Swords, RefreshCw, X, MessageSquare, ArrowRightLeft, Users, Search, Target, Trophy, Clock, Skull, Zap, Droplet, User as UserIcon, HelpCircle, Store as StoreIcon } from 'lucide-react';"

content = content.replace(import_target, import_replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
