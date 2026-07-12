import sys

with open('src/components/FriendsModal.tsx', 'r') as f:
    content = f.read()

# Imports
import_target = "import { HistoryModal } from './HistoryModal';"
import_replacement = "import { HistoryModal } from './HistoryModal';\nimport { ViewProfileModal } from './ViewProfileModal';\nimport { User as UserIcon } from 'lucide-react';"
content = content.replace(import_target, import_replacement)

# State
state_target = "const [selectedFriendHistory, setSelectedFriendHistory] = useState<User | null>(null);"
state_replacement = "const [selectedFriendHistory, setSelectedFriendHistory] = useState<User | null>(null);\n  const [selectedFriendProfile, setSelectedFriendProfile] = useState<User | null>(null);"
content = content.replace(state_target, state_replacement)

# Buttons
btn_target = """                     <div className="flex items-center gap-2 relative z-10">
                       <button 
                         onClick={() => challengeFriend(friend)}"""
btn_target_fallback = """                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => challengeFriend(friend)}"""

btn_replacement = """                     <div className="flex items-center gap-2 relative z-10">
                       <button 
                         onClick={() => setSelectedFriendProfile(friend)}
                         className="p-1.5 bg-[#3d3326] text-[#d4c3a1] rounded hover:bg-[#a67c52] hover:text-[#1a1814] transition-colors"
                         title="Ver Perfil"
                       >
                         <UserIcon className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => challengeFriend(friend)}"""

if btn_target in content:
    content = content.replace(btn_target, btn_replacement)
elif btn_target_fallback in content:
    content = content.replace(btn_target_fallback, btn_replacement)
else:
    print("Could not find button target")

# Modal render
modal_target = """      {selectedFriendHistory && (
        <div className="fixed inset-0 z-[60]">
          <HistoryModal userData={selectedFriendHistory} onClose={() => setSelectedFriendHistory(null)} />
        </div>
      )}
    </div>"""

modal_replacement = """      {selectedFriendHistory && (
        <div className="fixed inset-0 z-[60]">
          <HistoryModal userData={selectedFriendHistory} onClose={() => setSelectedFriendHistory(null)} />
        </div>
      )}
      {selectedFriendProfile && (
        <div className="fixed inset-0 z-[60]">
          <ViewProfileModal user={selectedFriendProfile} onClose={() => setSelectedFriendProfile(null)} />
        </div>
      )}
    </div>"""
content = content.replace(modal_target, modal_replacement)

with open('src/components/FriendsModal.tsx', 'w') as f:
    f.write(content)
print("done")
