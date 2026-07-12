const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');
const match = code.match(/const activateTrap = async[\s\S]*?\} catch\(e\) \{[\s\S]*?\};/);
console.log(match ? match[0] : "NOT FOUND");
