const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  /const p2Rounds = gameState\.player2\.roundsWon \|\| 0;/g,
  'const p2Rounds = gameState.player2?.roundsWon || 0;'
);
code = code.replace(
  /gameState\?\.player2\.roundsWon/g,
  'gameState?.player2?.roundsWon'
);
code = code.replace(
  /let p2Rounds = gameState\.player2\.roundsWon \|\| 0;/g,
  'let p2Rounds = gameState.player2?.roundsWon || 0;'
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed roundsWon');
