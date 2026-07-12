const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `        const cardIndex = chosenIndex;
        const cardToPlay = botState.hand[cardIndex];
        
        let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';`;

const insert = `        const cardIndex = chosenIndex;
        const cardToPlay = { ...botState.hand[cardIndex] };
        if (cardToPlay.type === 'Trap') {
          cardToPlay.isFacedown = true;
        }
        
        let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success bot trap');
