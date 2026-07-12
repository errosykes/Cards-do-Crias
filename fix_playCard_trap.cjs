const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const regex = /let isSpy = card\.effects\?\.includes\('Espião'\);[\s\S]*?if \(isAssassinSpy\) shouldDraw \+= 2;/m;

const replacement = `    const isTrap = playedCard.type === 'Trap';
    let isSpy = isTrap ? false : card.effects?.includes('Espião');
    let isAssassinSpy = isTrap ? false : card.effects?.includes('Espião Assassino');
    let isMedic = isTrap ? false : card.effects?.includes('Médico');
    let isScorch = isTrap ? false : card.effects?.includes('Queimar');
    let isThief = isTrap ? false : card.effects?.includes('Ladrão');
    let isDinheiroJuros = isTrap ? false : card.effects?.includes('Dinheiro a Juros');

    let shouldDraw = 0;
    if (!isTrap && card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (!isTrap && card.effects?.includes('Comprar 2')) shouldDraw += 2;
    if (isSpy) shouldDraw += 2;
    if (isAssassinSpy) shouldDraw += 2;`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success regex replace');
