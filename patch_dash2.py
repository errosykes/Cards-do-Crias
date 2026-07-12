import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """          <p className="text-[#d4c3a1]/60 text-[10px] tracking-widest uppercase">Prepare seu baralho para a batalha.</p>"""

replacement = """          <p className="text-[#d4c3a1]/60 text-[10px] tracking-widest uppercase">Prepare seu baralho para a batalha.</p>
          <div className="flex gap-2 text-[10px] uppercase font-bold tracking-widest mt-1">
             <span className="text-[#d4c3a1]/60">Nível: <span className="text-[#e2b17a]">{userData?.tournamentProgress || 1}</span></span>
             <span className="text-[#d4c3a1]/60">Cruzeiros: <span className="text-yellow-500">{userData?.cruzeiros || 0} C$</span></span>
          </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/Dashboard.tsx', 'w') as f:
        f.write(content)
    print("done")
else:
    print("Target not found")
