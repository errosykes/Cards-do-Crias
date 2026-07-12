import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

bad_str = """        <div className="w-full mt-4 flex gap-2 justify-center lg:justify-start">
           <button 
              onClick={() => setMainTab('geral')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'geral' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              Geral
           </button>
           <button 
              onClick={() => setMainTab('torneio')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'torneio' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              1º Torneio
           </button>
        </div>
      </div>"""

good_str = """      <div className="flex gap-2 mb-4 w-full justify-center">
           <button 
              onClick={() => setMainTab('geral')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'geral' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              Geral
           </button>
           <button 
              onClick={() => setMainTab('torneio')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'torneio' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              1º Torneio
           </button>
      </div>"""

content = content.replace(bad_str, good_str)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
