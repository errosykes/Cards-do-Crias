const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `    let isMedic = card.effects?.includes('Médico');
    if (isMedic && newGraveyard.length > 0) {`;

const insert = `    if (isMedic && newGraveyard.length > 0) {`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success activatetrap medic duplicate fix');
