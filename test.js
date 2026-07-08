const fs = require('fs');
const content = fs.readFileSync('src/pages/GameBoard.tsx', 'utf8');

const scorchHuman = content.match(/if \(isScorch\) \{[\s\S]*?if \(isMedic && newGraveyard.length > 0\)/);
console.log(scorchHuman ? scorchHuman[0] : "Not found human");

const scorchBot = content.match(/if \(isScorch\) \{[\s\S]*?if \(isMedic && newGraveyard\.length > 0\)/g);
console.log(scorchBot ? scorchBot.length : "Not found bot");
