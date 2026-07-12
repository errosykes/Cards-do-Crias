const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  "    updateData.turn = nextTurn;\n        \n        if (nextTurn === opponent?.uid && updatedOpponent && updatedOpponent.deck.length > 0) {",
  "    updateData.turn = nextTurn;\n    if (eventLogs && eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }\n        \n        if (nextTurn === opponent?.uid && updatedOpponent && updatedOpponent.deck.length > 0) {"
);

// If that failed, let's try a regex
gb = gb.replace(
  /updateData\.turn = nextTurn;\s*if \(nextTurn === opponent\?\.uid && updatedOpponent && updatedOpponent\.deck\.length > 0\) {/g,
  "updateData.turn = nextTurn;\n    if (eventLogs && eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }\n    if (nextTurn === opponent?.uid && updatedOpponent && updatedOpponent.deck.length > 0) {"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed missing logs');
