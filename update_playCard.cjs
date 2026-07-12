const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `    const cardIndex = me.hand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return;

    let newHand = [...me.hand];
    newHand.splice(cardIndex, 1);`;

const insert = `    const cardIndex = me.hand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return;

    let playedCard = { ...card };
    if (playedCard.type === 'Trap') {
      playedCard.isFacedown = true;
    }

    let newHand = [...me.hand];
    newHand.splice(cardIndex, 1);`;

if (code.includes(anchor)) {
  code = code.replace(anchor, insert);
  console.log('replaced setup');
}

code = code.replace(/card\.effects/g, 'playedCard.effects');
code = code.replace(/newGraveyard\.push\(card\);/g, 'newGraveyard.push(playedCard);');
code = code.replace(/updatedOpponent\.board\[targetRow\] = \[\.\.\.\(updatedOpponent\.board\[targetRow\] \|\| \[\]\)\, card\];/g, 'updatedOpponent.board[targetRow] = [...(updatedOpponent.board[targetRow] || []), playedCard];');
code = code.replace(/newBoard\[targetRow\] = \[\.\.\.\(newBoard\[targetRow\] \|\| \[\]\)\, card\];/g, 'newBoard[targetRow] = [...(newBoard[targetRow] || []), playedCard];');
code = code.replace(/newBoard\.scenario = card;/g, 'newBoard.scenario = playedCard;');

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Done replacing playCard variables');
