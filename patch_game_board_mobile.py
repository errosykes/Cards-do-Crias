import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """           <div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col md:flex-row items-center justify-center md:justify-between shrink-0 w-20 md:w-auto">"""
replacement = """           <div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col md:flex-row items-center justify-center md:justify-between shrink-0 w-24 md:w-auto gap-2">"""

content = content.replace(target, replacement)

target2 = """              <button onClick={() => { if(confirm('Sair da partida?')) navigate('/'); }} className="text-[#a67c52]/80 hover:text-white p-1 md:p-2 bg-red-900/30 hover:bg-red-800 rounded flex items-center justify-center transition-colors">
                 <ArrowLeft className="w-5 h-5 md:mr-1"/> 
                 <span className="hidden md:inline text-[10px] uppercase font-bold tracking-widest">Sair</span>
              </button>"""
replacement2 = """              <button onClick={() => { if(confirm('Sair da partida?')) navigate('/'); }} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-red-900/30 hover:bg-red-800 rounded flex items-center justify-center transition-colors w-full md:w-auto">
                 <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Sair</span>
              </button>"""
content = content.replace(target2, replacement2)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
