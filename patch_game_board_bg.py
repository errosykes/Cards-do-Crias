import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_bg_logic = """  const meleeBg = getEffectBackground('Buff de área melee') || getEffectBackground('Trap campo melee');
  const rangedBg = getEffectBackground('Buff de área ranged') || getEffectBackground('Trap campo Ranged');"""

new_bg_logic = """  const getSpecificBuffBackground = (rowCards: Card[]) => {
    const allScenarios = [
      ...(me?.board?.scenario ? [me.board.scenario] : []),
      ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])
    ];
    for (const sc of allScenarios) {
      if (sc.backgroundUrl) {
        if (sc.effects?.includes('BUFF DE ESPECIFICO') && sc.buffTargetNames) {
           for (const targetName of sc.buffTargetNames) {
              if (rowCards.some(c => c.name === targetName)) return sc.backgroundUrl;
           }
        }
        if (sc.effects?.includes('DBUFF DE ESPECIFICO') && sc.debuffTargetNames) {
           for (const targetName of sc.debuffTargetNames) {
              if (rowCards.some(c => c.name === targetName)) return sc.backgroundUrl;
           }
        }
      }
    }
    return undefined;
  };

  const allMelee = [...(me?.board?.melee || []), ...(opponent?.board?.melee || [])];
  const allRanged = [...(me?.board?.ranged || []), ...(opponent?.board?.ranged || [])];

  const meleeBg = getEffectBackground('Buff de área melee') || getEffectBackground('Trap campo melee') || getSpecificBuffBackground(allMelee);
  const rangedBg = getEffectBackground('Buff de área ranged') || getEffectBackground('Trap campo Ranged') || getSpecificBuffBackground(allRanged);"""

content = content.replace(old_bg_logic, new_bg_logic)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Patched background logic for specific buffs")
