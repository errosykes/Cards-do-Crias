import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Fix getRowScore signature and call
old_getRowScore = """export const getRowScore = (
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0
) => {
  if (!row) return 0;
  return row.reduce((acc, card) => acc + getCardPoints(card, row, scenario1, scenario2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps), 0);
};"""

new_getRowScore = """export const getRowScore = (
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0,
  allActiveCards: Card[] = []
) => {
  if (!row) return 0;
  return row.reduce((acc, card) => acc + getCardPoints(card, row, scenario1, scenario2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards), 0);
};"""

content = content.replace(old_getRowScore, new_getRowScore)

# Fix calculateScore
old_calcScore = """export const calculateScore = (player: GamePlayerState | null, opp: GamePlayerState | null) => {
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
  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];
  const globalRangedTraps = pRangedTraps + oRangedTraps;

  const meleeScore = getRowScore(player.board.melee, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);
  const rangedScore = getRowScore(player.board.ranged, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);
  return meleeScore + rangedScore;
};"""

new_calcScore = """export const calculateScore = (player: GamePlayerState | null, opp: GamePlayerState | null) => {
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

  const allActiveCards = [...(player.board.melee || []), ...(player.board.ranged || []), ...(player.board.scenario ? [player.board.scenario] : []), ...(opp?.board?.melee || []), ...(opp?.board?.ranged || []), ...(opp?.board?.scenario ? [opp.board.scenario] : [])];

  const meleeScore = getRowScore(player.board.melee, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
  const rangedScore = getRowScore(player.board.ranged, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
  return meleeScore + rangedScore;
};"""

content = content.replace(old_calcScore, new_calcScore)

# Add allActiveCards inside GameBoard so it's available to getPoints
gameboard_allcards_addition = """  const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
  const globalRangedTraps = pRangedTraps + oRangedTraps;
  
  const allActiveCards = [
    ...(me?.board?.melee || []), 
    ...(me?.board?.ranged || []), 
    ...(me?.board?.scenario ? [me.board.scenario] : []), 
    ...(opponent?.board?.melee || []), 
    ...(opponent?.board?.ranged || []), 
    ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])
  ];"""

# Wait, globalRangedTraps already exists inside GameBoard Component? Let's check GameBoard component
content = content.replace(
    "const globalMeleeTraps = pMeleeTraps + oMeleeTraps;\n  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];",
    ""
)

# Insert after globalRangedTraps = pRangedTraps + oRangedTraps;
content = re.sub(
    r"const globalRangedTraps = pRangedTraps \+ oRangedTraps;",
    r"const globalRangedTraps = pRangedTraps + oRangedTraps;\n  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];",
    content
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
