const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  /if \(card\.effects\?\.includes\('Comprar 2'\)\) shouldDraw \+= 2;/g,
  "if (card.effects?.includes('Comprar 2')) shouldDraw += 2;\n    if (isAssassinSpy) shouldDraw += 2;"
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed shouldDraw');
