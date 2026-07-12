const fs = require('fs');
let code = fs.readFileSync('src/lib/effects.ts', 'utf-8');

code = code.replace(
  /'Dinheiro a Juros': 'Jogue no campo inimigo\. O valor da carta é adicionado aos pontos do oponente, e obriga o oponente a descartar uma carta do topo do baralho dele para o cemitério\.',/,
  "'Dinheiro a Juros': 'Jogue no campo inimigo. O valor da carta é adicionado aos pontos do oponente, mas obriga o oponente a comprar e jogar a carta do topo do seu baralho imediatamente.',"
);

fs.writeFileSync('src/lib/effects.ts', code);
console.log('Fixed Dinheiro a juros effect');
