import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """              <div className="text-center">
                {gameState.status === 'finished' ? ("""

replacement = """              <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">
                 <MessageSquare className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Chat</span>
                 {gameState.chatMessages && gameState.chatMessages.length > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {gameState.chatMessages.length}
                    </span>
                 )}
              </button>
              <div className="text-center">
                {gameState.status === 'finished' ? ("""

if "setIsChatOpen(!isChatOpen)" not in content:
    content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
