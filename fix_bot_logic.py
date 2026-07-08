import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Fix definition in doBotTurn
content = content.replace(
    "let isSpy = cardToPlay.effects?.includes('Espião');",
    "let isSpy = cardToPlay.effects?.includes('Espião');\n        let isAssassinSpy = cardToPlay.effects?.includes('Espião Assassino');"
)

# Fix targetRow condition in doBotTurn
content = content.replace(
    "} else if (isSpy && updatedPlayer1) {",
    "} else if ((isSpy || isAssassinSpy) && updatedPlayer1) {"
)

# In doBotTurn, the logic that was inserted uses updatedOpponent instead of updatedPlayer1.
# Let's find it. It's right after:
bot_target = """    if (isAssassinSpy && updatedOpponent) {
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

# Let's split content by the bot_target block, we know there are 2 occurrences.
# The first one is in doBotTurn, the second is in playCard.
parts = content.split(bot_target)

if len(parts) == 3:
    # First part corresponds to the one in doBotTurn
    bot_logic = bot_target.replace('updatedOpponent', 'updatedPlayer1').replace('card.id', 'cardToPlay.id')
    content = parts[0] + bot_logic + parts[1] + bot_target + parts[2]

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Bot logic fixed")
