import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_bg = """  const getSpecificBuffBackground = (rowCards: Card[]) => {
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
  };"""

new_bg = """  const getSpecificBuffBackground = (rowCards: Card[]) => {
    for (const sc of allActiveCards) {
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
  };"""

content = content.replace(old_bg, new_bg)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("done")
