import sys

with open('src/components/FriendsModal.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import { HistoryModal } from' not in content:
    content = content.replace("import { ArrowRightLeft, Check, X, Swords } from 'lucide-react';", "import { ArrowRightLeft, Check, X, Swords, Trophy } from 'lucide-react';\nimport { HistoryModal } from './HistoryModal';")

# Add state
if 'const [selectedFriendHistory, setSelectedFriendHistory]' not in content:
    content = content.replace("const [error, setError] = useState('');", "const [error, setError] = useState('');\n  const [selectedFriendHistory, setSelectedFriendHistory] = useState<User | null>(null);")

# Add render at bottom
if 'selectedFriendHistory && (' not in content:
    content = content.replace("    </div>\n  );\n}", "      {selectedFriendHistory && (\n        <div className=\"fixed inset-0 z-[60]\">\n          <HistoryModal userData={selectedFriendHistory} onClose={() => setSelectedFriendHistory(null)} />\n        </div>\n      )}\n    </div>\n  );\n}")

# Add button to friends list
friend_btn_target = """                      <button 
                         onClick={() => removeFriend(friend.uid)}
                         className="p-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded transition-colors"
                         title="Remover"
                      >
                         <UserMinus className="w-4 h-4" />
                      </button>"""

friend_btn_replacement = """                      <button 
                         onClick={() => setSelectedFriendHistory(friend)}
                         className="p-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded transition-colors"
                         title="Ver Histórico"
                      >
                         <Trophy className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => removeFriend(friend.uid)}
                         className="p-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded transition-colors"
                         title="Remover"
                      >
                         <UserMinus className="w-4 h-4" />
                      </button>"""

if 'setSelectedFriendHistory(friend)' not in content:
    content = content.replace(friend_btn_target, friend_btn_replacement)

with open('src/components/FriendsModal.tsx', 'w') as f:
    f.write(content)
print("done")
