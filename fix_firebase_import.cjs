const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(/@\/lib\/firebase/g, '../lib/firebase');

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success firebase import');
