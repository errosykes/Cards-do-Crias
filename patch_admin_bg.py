import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

old_cond = "{(effects.includes('Buff de área ranged') || effects.includes('Buff de área melee') || effects.includes('Trap campo Ranged') || effects.includes('Trap campo melee')) && ("
new_cond = "{(effects.includes('Buff de área ranged') || effects.includes('Buff de área melee') || effects.includes('Trap campo Ranged') || effects.includes('Trap campo melee') || effects.includes('BUFF DE ESPECIFICO') || effects.includes('DBUFF DE ESPECIFICO')) && ("

content = content.replace(old_cond, new_cond)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)

print("Patched background input condition")
