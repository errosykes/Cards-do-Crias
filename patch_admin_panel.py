import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

target = """                <div className="text-[10px] font-mono text-[#a67c52]/50 break-all bg-black/40 p-1 rounded mb-4">
                  UID: {player.uid}
                </div>"""

replacement = """                <div className="text-[10px] font-mono text-[#a67c52]/50 break-all bg-black/40 p-1 rounded mb-4">
                  UID: {player.uid}
                </div>
                
                <div className="mb-4">
                   <button
                     onClick={async () => {
                        try {
                           await updateDoc(doc(db, 'users', player.uid), {
                              hasAllCards: !player.hasAllCards
                           });
                        } catch (e) {
                           console.error(e);
                        }
                     }}
                     className={`w-full py-1.5 rounded text-[10px] uppercase font-bold tracking-widest transition-colors ${player.hasAllCards ? 'bg-[#a67c52] text-[#141210] hover:bg-[#a67c52]/80' : 'bg-[#3d3326] text-[#d4c3a1]/80 hover:bg-[#4d4030]'}`}
                   >
                     {player.hasAllCards ? 'Desativar Todas as Cartas' : 'Liberar Todas as Cartas'}
                   </button>
                </div>"""

if "Desativar Todas as Cartas" not in content:
    content = content.replace(target, replacement)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)
print("done")
