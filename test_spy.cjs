const fs = require('fs');
const content = fs.readFileSync('src/pages/GameBoard.tsx', 'utf8');

const m = content.match(/if \(isSpy && updatedOpponent\) \{([\s\S]*?)\} else \{/);
console.log(m ? m[1] : "Not found");
