const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  /let isAssassinSpy = card\.effects\?\.includes\('Espião Assassino'\);/g,
  "let isAssassinSpy = card.effects?.some((e: string) => e.includes('Espião Assassino'));"
);

code = code.replace(
  /let isAssassinSpy = isTrap \? false : card\.effects\?\.includes\('Espião Assassino'\);/g,
  "let isAssassinSpy = isTrap ? false : card.effects?.some((e: string) => e.includes('Espião Assassino'));"
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed isAssassinSpy includes');
