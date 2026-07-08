import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

new_logic = """  if (!isHero) {
    const moraleBoosters = row.filter(c => c !== card && c.effects?.includes('Impulso Moral')).length;
    pts += moraleBoosters;
    
    if (scenario1?.effects?.includes('BUFF DE ESPECIFICO') && scenario1.buffTargetName?.toLowerCase() === card.name.toLowerCase()) pts += 1;
    if (scenario2?.effects?.includes('BUFF DE ESPECIFICO') && scenario2.buffTargetName?.toLowerCase() === card.name.toLowerCase()) pts += 1;
    if (scenario1?.effects?.includes('DBUFF DE ESPECIFICO') && scenario1.debuffTargetName?.toLowerCase() === card.name.toLowerCase()) pts -= 1;
    if (scenario2?.effects?.includes('DBUFF DE ESPECIFICO') && scenario2.debuffTargetName?.toLowerCase() === card.name.toLowerCase()) pts -= 1;
"""

content = content.replace(
    "  if (!isHero) {\n    const moraleBoosters = row.filter(c => c !== card && c.effects?.includes('Impulso Moral')).length;\n    pts += moraleBoosters;",
    new_logic
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Updated getCardPoints")
