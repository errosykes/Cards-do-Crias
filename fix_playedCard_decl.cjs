const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `    let newHand = [...me.hand];
    newHand.splice(cardIndex, 1);`;

const insert = `    let playedCard = { ...card };
    if (playedCard.type === 'Trap') {
      playedCard.isFacedown = true;
    }

    let newHand = [...me.hand];
    newHand.splice(cardIndex, 1);`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success defined playedCard');
