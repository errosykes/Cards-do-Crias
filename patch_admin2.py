import sys
import re

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Replace state initialization
content = content.replace(
    "const [buffTargetName, setBuffTargetName] = useState('');\n  const [debuffTargetName, setDebuffTargetName] = useState('');",
    "const [buffTargetNames, setBuffTargetNames] = useState<string[]>([]);\n  const [debuffTargetNames, setDebuffTargetNames] = useState<string[]>([]);"
)

# Replace reset
content = content.replace(
    "setBuffTargetName('');\n    setDebuffTargetName('');",
    "setBuffTargetNames([]);\n    setDebuffTargetNames([]);"
)

# Replace edit
content = content.replace(
    "setBuffTargetName(card.buffTargetName || '');\n    setDebuffTargetName(card.debuffTargetName || '');",
    "setBuffTargetNames(card.buffTargetNames || (card.buffTargetName ? [card.buffTargetName] : []));\n    setDebuffTargetNames(card.debuffTargetNames || (card.debuffTargetName ? [card.debuffTargetName] : []));"
)

# Replace submit
content = content.replace(
    "buffTargetName,\n      debuffTargetName",
    "buffTargetNames,\n      debuffTargetNames"
)

# Replace UI
old_ui = """              {effects.includes('BUFF DE ESPECIFICO') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#a67c52] uppercase tracking-widest">Nome da Carta para Buff (+1)</label>
                  <input
                    type="text"
                    value={buffTargetName}
                    onChange={(e) => setBuffTargetName(e.target.value)}
                    className="w-full bg-[#1a1814] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                    placeholder="Ex: Geralt de Rívia"
                  />
                </div>
              )}
              {effects.includes('DBUFF DE ESPECIFICO') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#a67c52] uppercase tracking-widest">Nome da Carta para Debuff (-1)</label>
                  <input
                    type="text"
                    value={debuffTargetName}
                    onChange={(e) => setDebuffTargetName(e.target.value)}
                    className="w-full bg-[#1a1814] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                    placeholder="Ex: Arqueiro de Elite"
                  />
                </div>
              )}"""

new_ui = """              {effects.includes('BUFF DE ESPECIFICO') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#a67c52] uppercase tracking-widest">Cartas para Buff (+1)</label>
                  <div className="flex flex-wrap gap-2">
                    {cards.map(c => (
                      <label key={`buff-${c.id}`} className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                        <input
                          type="checkbox"
                          checked={buffTargetNames.includes(c.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBuffTargetNames([...buffTargetNames, c.name]);
                            } else {
                              setBuffTargetNames(buffTargetNames.filter(n => n !== c.name));
                            }
                          }}
                          className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {effects.includes('DBUFF DE ESPECIFICO') && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#a67c52] uppercase tracking-widest">Cartas para Debuff (-1)</label>
                  <div className="flex flex-wrap gap-2">
                    {cards.map(c => (
                      <label key={`debuff-${c.id}`} className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                        <input
                          type="checkbox"
                          checked={debuffTargetNames.includes(c.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDebuffTargetNames([...debuffTargetNames, c.name]);
                            } else {
                              setDebuffTargetNames(debuffTargetNames.filter(n => n !== c.name));
                            }
                          }}
                          className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                        />
                        {c.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}"""

content = content.replace(old_ui, new_ui)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)

print("Patched AdminPanel logic")
