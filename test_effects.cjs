const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');
const match = code.match(/let isSpy = .*?if \(isDinheiroJuros && updatedOpponent\) \{.*?\}/s);
console.log(match ? "FOUND" : "NOT FOUND");
