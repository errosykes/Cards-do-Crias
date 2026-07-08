import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

import re

# Find the human scorch block
# It starts with: if (isScorch) {
# And ends before: if (isMedic && newGraveyard.length > 0) {
pattern = r"if \(isScorch\) \{[\s\S]*?if \(isMedic && newGraveyard\.length > 0\) \{"

def replace_scorch(match):
    scorch_text = match.group(0)
    # We replace the body of if (isScorch)
    new_scorch = """if (isScorch) {
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

      const getPoints = (c, row, sc1, sc2) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);

      let highestPoints = -1;
      
      newBoard.melee.forEach(c => {
        const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedOpponent?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      newBoard.ranged.forEach(c => {
        const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedOpponent?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      if (updatedOpponent) {
        updatedOpponent.board.melee.forEach(c => {
          const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
        updatedOpponent.board.ranged.forEach(c => {
          const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
      }
      
      if (highestPoints > -1) {
        newBoard.melee = newBoard.melee.filter(c => {
          const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedOpponent?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        newBoard.ranged = newBoard.ranged.filter(c => {
          const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedOpponent?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        if (updatedOpponent) {
          updatedOpponent.board.melee = updatedOpponent.board.melee.filter(c => {
            const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedOpponent.graveyard.push(c);
              return false;
            }
            return true;
          });
          updatedOpponent.board.ranged = updatedOpponent.board.ranged.filter(c => {
            const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedOpponent.graveyard.push(c);
              return false;
            }
            return true;
          });
        }
      }
    }
    
    if (isMedic && newGraveyard.length > 0) {"""
    
    # But wait! For the BOT, the variable names are slightly different!
    # In Bot logic:
    # updatedOpponent -> updatedPlayer1
    if "updatedOpponent" in scorch_text:
        return new_scorch
    else:
        # It's the bot logic!
        return new_scorch.replace("updatedOpponent", "updatedPlayer1")

new_content = re.sub(pattern, replace_scorch, content)

if content != new_content:
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(new_content)
    print("Patched scorch logic")
else:
    print("Could not patch scorch")

