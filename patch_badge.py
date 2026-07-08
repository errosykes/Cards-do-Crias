import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

target = """                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-sm uppercase text-[#e2b17a]">{player.username}</h3>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${player.role === 'admin' ? 'bg-[#a67c52]/20 text-[#a67c52] border border-[#a67c52]/30' : 'bg-[#3d3326] text-[#d4c3a1]/60'}`}>
                    {player.role}
                  </span>
                </div>"""

replacement = """                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                     <h3 className="font-bold text-sm uppercase text-[#e2b17a]">{player.username}</h3>
                     {player.hasAllCards && player.role !== 'admin' && (
                        <span className="text-[8px] bg-green-900/40 text-green-400 border border-green-500/30 px-1 rounded uppercase tracking-wider">
                           All Cards
                        </span>
                     )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${player.role === 'admin' ? 'bg-[#a67c52]/20 text-[#a67c52] border border-[#a67c52]/30' : 'bg-[#3d3326] text-[#d4c3a1]/60'}`}>
                    {player.role}
                  </span>
                </div>"""

if "All Cards" not in content:
    content = content.replace(target, replacement)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)
print("done")
