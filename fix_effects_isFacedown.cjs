const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `    let isSpy = card.effects?.includes('Espião');
    let isAssassinSpy = card.effects?.includes('Espião Assassino');
    let isMedic = card.effects?.includes('Médico');
    let isScorch = card.effects?.includes('Queimar');
    let isThief = card.effects?.includes('Ladrão');
    let isDinheiroJuros = card.effects?.includes('Dinheiro a Juros');

    let shouldDraw = 0;
    if (card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (card.effects?.includes('Comprar 2')) shouldDraw += 2;`;

const insert = `    let isSpy = playedCard.isFacedown ? false : playedCard.effects?.includes('Espião');
    let isAssassinSpy = playedCard.isFacedown ? false : playedCard.effects?.includes('Espião Assassino');
    let isMedic = playedCard.isFacedown ? false : playedCard.effects?.includes('Médico');
    let isScorch = playedCard.isFacedown ? false : playedCard.effects?.includes('Queimar');
    let isThief = playedCard.isFacedown ? false : playedCard.effects?.includes('Ladrão');
    let isDinheiroJuros = playedCard.isFacedown ? false : playedCard.effects?.includes('Dinheiro a Juros');

    let shouldDraw = 0;
    if (!playedCard.isFacedown && playedCard.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (!playedCard.isFacedown && playedCard.effects?.includes('Comprar 2')) shouldDraw += 2;`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success playCard facedown effects');
