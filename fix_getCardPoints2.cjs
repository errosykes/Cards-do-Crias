const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `export const getCardPoints = (
  card: Card, 
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0,
  allActiveCards: Card[] = []
) => {
  let pts = card.points || 0;`;

const insert = `export const getCardPoints = (
  card: Card, 
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0,
  allActiveCards: Card[] = []
) => {
  if (card.isFacedown) return 0;
  let pts = card.points || 0;`;

if (code.includes(anchor)) {
  code = code.replace(anchor, insert);
  fs.writeFileSync('src/pages/GameBoard.tsx', code);
  console.log('Success getCardPoints2');
} else {
  console.log('Failed getCardPoints2');
}
