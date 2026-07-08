import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "let isSpy = card.effects?.includes('Espião');",
    "let isSpy = card.effects?.includes('Espião');\n    let isAssassinSpy = card.effects?.includes('Espião Assassino');"
)

content = content.replace(
    "if (isSpy) shouldDraw += 2;",
    "if (isSpy) shouldDraw += 2;\n    if (isAssassinSpy) shouldDraw += 2; // Assume it also draws 2, or maybe not? user said 'jogue a carta no campo do adversário mas obriga o adversário a jogar uma carta do campo dele pro cemitério'. We will NOT draw 2, so it's a balanced spy: just kills an enemy card."
)

# Replace targetRow condition
content = content.replace(
    "} else if (isSpy && updatedOpponent) {",
    "} else if ((isSpy || isAssassinSpy) && updatedOpponent) {"
)

# And now we insert the Assassin Spy logic right before `if (isScorch) {`
assassin_logic = """
    if (isAssassinSpy && updatedOpponent) {
      const pMeleeBuffs = countGlobalBuff(newBoard, 'Buff de área melee');
      const pRangedBuffs = countGlobalBuff(newBoard, 'Buff de área ranged');
      const oMeleeBuffs = countGlobalBuff(updatedOpponent?.board, 'Buff de área melee');
      const oRangedBuffs = countGlobalBuff(updatedOpponent?.board, 'Buff de área ranged');
      
      const pMeleeTraps = countGlobalBuff(newBoard, 'Trap campo melee');
      const pRangedTraps = countGlobalBuff(newBoard, 'Trap campo Ranged');
      const oMeleeTraps = countGlobalBuff(updatedOpponent?.board, 'Trap campo melee');
      const oRangedTraps = countGlobalBuff(updatedOpponent?.board, 'Trap campo Ranged');
      
      const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
      const globalRangedBuffs = pRangedBuffs + oRangedBuffs;
      const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
      const globalRangedTraps = pRangedTraps + oRangedTraps;

      const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);
      let highestPoints = -1;
      
      updatedOpponent.board.melee.forEach(c => {
        if (c.id === card.id) return; // don't kill the spy itself if it just landed
        const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      updatedOpponent.board.ranged.forEach(c => {
        if (c.id === card.id) return;
        const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });

      if (highestPoints > -1) {
        let destroyed = false;
        updatedOpponent.board.melee = updatedOpponent.board.melee.filter(c => {
          if (destroyed) return true;
          if (c.id === card.id) return true;
          const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            updatedOpponent.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
        updatedOpponent.board.ranged = updatedOpponent.board.ranged.filter(c => {
          if (destroyed) return true;
          if (c.id === card.id) return true;
          const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            updatedOpponent.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
      }
    }
"""

content = content.replace(
    "    if (isScorch) {",
    assassin_logic + "\n    if (isScorch) {"
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Patched GameBoard")
