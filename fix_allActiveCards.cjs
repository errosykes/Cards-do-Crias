const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `  const allActiveCards = [
    ...(me?.board.melee || []), ...(me?.board.ranged || []), me?.board.scenario,
    ...(opponent?.board.melee || []), ...(opponent?.board.ranged || []), opponent?.board.scenario
  ].filter(Boolean) as Card[];`;

const insert = `  const allActiveCards = [
    ...(me?.board.melee || []), ...(me?.board.ranged || []), me?.board.scenario,
    ...(opponent?.board.melee || []), ...(opponent?.board.ranged || []), opponent?.board.scenario
  ].filter(c => c && !c.isFacedown) as Card[];`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success allActiveCards');
