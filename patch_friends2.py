import sys

with open('src/components/FriendsModal.tsx', 'r') as f:
    content = f.read()

target = """                       <button 
                         onClick={() => removeFriend(friend.uid)}
                         className="p-1.5 bg-red-950/50 text-red-500 rounded hover:bg-red-900 transition-colors"
                         title="Remover Amigo"
                       >"""

replacement = """                       <button 
                         onClick={() => setSelectedFriendHistory(friend)}
                         className="p-1.5 bg-yellow-900/50 text-yellow-500 rounded hover:bg-yellow-800 transition-colors"
                         title="Ver Histórico"
                       >
                         <Trophy className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => removeFriend(friend.uid)}
                         className="p-1.5 bg-red-950/50 text-red-500 rounded hover:bg-red-900 transition-colors"
                         title="Remover Amigo"
                       >"""

content = content.replace(target, replacement)

with open('src/components/FriendsModal.tsx', 'w') as f:
    f.write(content)
print("done")
