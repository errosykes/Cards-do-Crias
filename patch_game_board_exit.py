import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """              <button onClick={() => navigate('/')} className="text-[#a67c52]/60 hover:text-[#a67c52] p-1"><ArrowLeft className="w-5 h-5"/></button>"""
replacement = """              <button onClick={() => { if(confirm('Sair da partida?')) navigate('/'); }} className="text-[#a67c52]/80 hover:text-white p-1 md:p-2 bg-red-900/30 hover:bg-red-800 rounded flex items-center justify-center transition-colors">
                 <ArrowLeft className="w-5 h-5 md:mr-1"/> 
                 <span className="hidden md:inline text-[10px] uppercase font-bold tracking-widest">Sair</span>
              </button>"""

if "Sair da partida" not in content:
    content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
