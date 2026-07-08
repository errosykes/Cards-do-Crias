import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# 1. Update getCardPoints signature
old_sig = """export const getCardPoints = (
  card: Card, 
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0
) => {"""

new_sig = """export const getCardPoints = (
  card: Card, 
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0,
  allActiveCards: Card[] = []
) => {"""

content = content.replace(old_sig, new_sig)

# 2. Update getCardPoints logic
old_logic = """    if (scenario1?.effects?.includes('BUFF DE ESPECIFICO') && scenario1.buffTargetNames?.includes(card.name)) pts += 1;
    if (scenario2?.effects?.includes('BUFF DE ESPECIFICO') && scenario2.buffTargetNames?.includes(card.name)) pts += 1;
    if (scenario1?.effects?.includes('DBUFF DE ESPECIFICO') && scenario1.debuffTargetNames?.includes(card.name)) pts -= 1;
    if (scenario2?.effects?.includes('DBUFF DE ESPECIFICO') && scenario2.debuffTargetNames?.includes(card.name)) pts -= 1;"""

new_logic = """    let specificBuffs = 0;
    let specificDebuffs = 0;
    
    if (allActiveCards && allActiveCards.length > 0) {
      allActiveCards.forEach(c => {
        if (c.effects?.includes('BUFF DE ESPECIFICO') && c.buffTargetNames?.includes(card.name)) specificBuffs += 1;
        if (c.effects?.includes('DBUFF DE ESPECIFICO') && c.debuffTargetNames?.includes(card.name)) specificDebuffs += 1;
      });
    } else {
      if (scenario1?.effects?.includes('BUFF DE ESPECIFICO') && scenario1.buffTargetNames?.includes(card.name)) specificBuffs += 1;
      if (scenario2?.effects?.includes('BUFF DE ESPECIFICO') && scenario2.buffTargetNames?.includes(card.name)) specificBuffs += 1;
      if (scenario1?.effects?.includes('DBUFF DE ESPECIFICO') && scenario1.debuffTargetNames?.includes(card.name)) specificDebuffs += 1;
      if (scenario2?.effects?.includes('DBUFF DE ESPECIFICO') && scenario2.debuffTargetNames?.includes(card.name)) specificDebuffs += 1;
    }
    
    pts += specificBuffs;
    pts -= specificDebuffs;"""

content = content.replace(old_logic, new_logic)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Patched getCardPoints signature and logic")
