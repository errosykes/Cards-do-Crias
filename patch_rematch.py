import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_ui = """            {gameState.status === 'finished' && !gameState.isBotMatch && (
              <div className="w-full mt-6 flex flex-col gap-2">
                {gameState.rematchRequestedBy === userData.uid ? (
                   <div className="text-[10px] text-center text-[#e2b17a] border border-[#e2b17a]/30 p-2 rounded uppercase font-bold tracking-widest bg-[#e2b17a]/10">
                      Revanche Solicitada...
                   </div>
                ) : gameState.rematchRequestedBy ? (
                   <button 
                     onClick={acceptRematch}
                     className="w-full py-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-[#d4c3a1]/80 border border-blue-900/30 rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Check className="w-3 h-3" /> Aceitar Revanche
                   </button>
                ) : (
                   <button 
                     onClick={requestRematch}
                     className="w-full py-2 bg-gradient-to-r from-[#3d3326] to-[#1a1814] hover:from-[#a67c52]/40 hover:to-[#3d3326] text-[#d4c3a1]/80 border border-[#3d3326] rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Swords className="w-3 h-3" /> Solicitar Revanche
                   </button>
                )}
              </div>
            )}"""

new_ui = """            {gameState.status === 'finished' && (
              <div className="w-full mt-6 flex flex-col gap-2">
                {gameState.isBotMatch ? (
                   <button 
                     onClick={requestRematch}
                     className="w-full py-2 bg-gradient-to-r from-[#3d3326] to-[#1a1814] hover:from-[#a67c52]/40 hover:to-[#3d3326] text-[#d4c3a1]/80 border border-[#3d3326] rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Swords className="w-3 h-3" /> Jogar Novamente
                   </button>
                ) : gameState.rematchRequestedBy === userData.uid ? (
                   <div className="text-[10px] text-center text-[#e2b17a] border border-[#e2b17a]/30 p-2 rounded uppercase font-bold tracking-widest bg-[#e2b17a]/10">
                      Revanche Solicitada...
                   </div>
                ) : gameState.rematchRequestedBy ? (
                   <button 
                     onClick={acceptRematch}
                     className="w-full py-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-[#d4c3a1]/80 border border-blue-900/30 rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Check className="w-3 h-3" /> Aceitar Revanche
                   </button>
                ) : (
                   <button 
                     onClick={requestRematch}
                     className="w-full py-2 bg-gradient-to-r from-[#3d3326] to-[#1a1814] hover:from-[#a67c52]/40 hover:to-[#3d3326] text-[#d4c3a1]/80 border border-[#3d3326] rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Swords className="w-3 h-3" /> Solicitar Revanche
                   </button>
                )}
              </div>
            )}"""

if old_ui in content:
    content = content.replace(old_ui, new_ui)
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("UI patched")
else:
    print("Old UI not found")

