import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

# Make sure we map unique names in both BUFF and DBUFF sections
old_buff = """{cards.map(c => (
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
                    ))}"""

new_buff = """{Array.from(new Set(cards.map(c => c.name))).map(name => (
                      <label key={`buff-${name}`} className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                        <input
                          type="checkbox"
                          checked={buffTargetNames.includes(name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBuffTargetNames([...buffTargetNames, name]);
                            } else {
                              setBuffTargetNames(buffTargetNames.filter(n => n !== name));
                            }
                          }}
                          className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                        />
                        {name}
                      </label>
                    ))}"""

old_debuff = """{cards.map(c => (
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
                    ))}"""

new_debuff = """{Array.from(new Set(cards.map(c => c.name))).map(name => (
                      <label key={`debuff-${name}`} className="flex items-center gap-2 text-xs text-[#d4c3a1] cursor-pointer hover:text-[#e2b17a]">
                        <input
                          type="checkbox"
                          checked={debuffTargetNames.includes(name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDebuffTargetNames([...debuffTargetNames, name]);
                            } else {
                              setDebuffTargetNames(debuffTargetNames.filter(n => n !== name));
                            }
                          }}
                          className="rounded border-[#3d3326] bg-black/50 text-[#a67c52] focus:ring-[#a67c52]"
                        />
                        {name}
                      </label>
                    ))}"""

content = content.replace(old_buff, new_buff)
content = content.replace(old_debuff, new_debuff)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)

print("done deduplicating")
