import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

start_idx = content.find("export const calculateScore =")
end_idx = content.find("};", start_idx) + 2

new_calc = """export const calculateScore = (player: GamePlayerState | null, opp: GamePlayerState | null) => {
  if (!player || !player.board) return 0;
  
  const pMeleeBuffs = countGlobalBuff(player.board, 'Buff de área melee');
  const pRangedBuffs = countGlobalBuff(player.board, 'Buff de área ranged');
  const oMeleeBuffs = countGlobalBuff(opp?.board, 'Buff de área melee');
  const oRangedBuffs = countGlobalBuff(opp?.board, 'Buff de área ranged');
  
  const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
  const globalRangedBuffs = pRangedBuffs + oRangedBuffs;

  const pMeleeTraps = countGlobalBuff(player.board, 'Trap campo melee');
  const pRangedTraps = countGlobalBuff(player.board, 'Trap campo Ranged');
  const oMeleeTraps = countGlobalBuff(opp?.board, 'Trap campo melee');
  const oRangedTraps = countGlobalBuff(opp?.board, 'Trap campo Ranged');
  
  const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
  const globalRangedTraps = pRangedTraps + oRangedTraps;
  
  const allActiveCards = [
    ...(player.board.melee || []), 
    ...(player.board.ranged || []), 
    ...(player.board.scenario ? [player.board.scenario] : []), 
    ...(opp?.board?.melee || []), 
    ...(opp?.board?.ranged || []), 
    ...(opp?.board?.scenario ? [opp.board.scenario] : [])
  ];

  const meleeScore = getRowScore(player.board.melee, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
  const rangedScore = getRowScore(player.board.ranged, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
  
  return meleeScore + rangedScore;
};"""

content = content[:start_idx] + new_calc + content[end_idx:]

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
