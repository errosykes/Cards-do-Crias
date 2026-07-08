import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

# 1. Add to PREDEFINED_EFFECTS
content = content.replace(
    "'Trap campo Ranged',",
    "'Trap campo Ranged',\n  'BUFF DE ESPECIFICO',\n  'DBUFF DE ESPECIFICO',"
)

# 2. Add state
content = content.replace(
    "const [effects, setEffects] = useState<string[]>([]);",
    "const [effects, setEffects] = useState<string[]>([]);\n  const [buffTargetName, setBuffTargetName] = useState('');\n  const [debuffTargetName, setDebuffTargetName] = useState('');"
)

# 3. Handle edit
content = content.replace(
    "setEffects(card.effects || []);",
    "setEffects(card.effects || []);\n    setBuffTargetName(card.buffTargetName || '');\n    setDebuffTargetName(card.debuffTargetName || '');"
)

# 4. Handle submit
content = content.replace(
    "effects\n    };",
    "effects,\n      buffTargetName,\n      debuffTargetName\n    };"
)

# 5. Handle reset
content = content.replace(
    "setEffects([]);",
    "setEffects([]);\n    setBuffTargetName('');\n    setDebuffTargetName('');"
)

# 6. Add UI for the new fields
input_ui = """
              {effects.includes('BUFF DE ESPECIFICO') && (
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
              )}
"""

content = content.replace(
    "</div>\n            <div className=\"flex gap-2 mt-4\">",
    "</div>\n            " + input_ui + "\n            <div className=\"flex gap-2 mt-4\">"
)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)
