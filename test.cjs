const fs = require('fs');
const content = fs.readFileSync('src/pages/GameBoard.tsx', 'utf8');

const scorchInstances = content.match(/if \(isScorch\) \{[\s\S]*?if \(isMedic && newGraveyard\.length > 0\)/g);
console.log(scorchInstances ? scorchInstances.length : "Not found");
