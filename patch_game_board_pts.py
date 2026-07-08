import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_logic = """    if (scenario1?.effects?.includes('BUFF DE ESPECIFICO') && scenario1.buffTargetName?.toLowerCase() === card.name.toLowerCase()) pts += 1;
    if (scenario2?.effects?.includes('BUFF DE ESPECIFICO') && scenario2.buffTargetName?.toLowerCase() === card.name.toLowerCase()) pts += 1;
    if (scenario1?.effects?.includes('DBUFF DE ESPECIFICO') && scenario1.debuffTargetName?.toLowerCase() === card.name.toLowerCase()) pts -= 1;
    if (scenario2?.effects?.includes('DBUFF DE ESPECIFICO') && scenario2.debuffTargetName?.toLowerCase() === card.name.toLowerCase()) pts -= 1;"""

new_logic = """    if (scenario1?.effects?.includes('BUFF DE ESPECIFICO') && scenario1.buffTargetNames?.includes(card.name)) pts += 1;
    if (scenario2?.effects?.includes('BUFF DE ESPECIFICO') && scenario2.buffTargetNames?.includes(card.name)) pts += 1;
    if (scenario1?.effects?.includes('DBUFF DE ESPECIFICO') && scenario1.debuffTargetNames?.includes(card.name)) pts -= 1;
    if (scenario2?.effects?.includes('DBUFF DE ESPECIFICO') && scenario2.debuffTargetNames?.includes(card.name)) pts -= 1;"""

content = content.replace(old_logic, new_logic)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Patched getCardPoints for multiple specific targets")
