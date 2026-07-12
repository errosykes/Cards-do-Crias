const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const botPlayAnchor = `        } else {
          newBoard[targetRow] = [...(newBoard[targetRow] || []), cardToPlay];
        }
        
    
    if (isAssassinSpy && updatedPlayer1) {`;

const botPlayInsert = `        } else {
          newBoard[targetRow] = [...(newBoard[targetRow] || []), cardToPlay];
        }
        
        if (cardToPlay.effects?.includes('Ladrão') && updatedPlayer1) {
          if (updatedPlayer1.hand.length > 0) {
            const randomIndex = Math.floor(Math.random() * updatedPlayer1.hand.length);
            const stolenCard = updatedPlayer1.hand.splice(randomIndex, 1)[0];
            newHand.push(stolenCard);
          }
        }
        
        if (isDinheiroJuros && updatedPlayer1) {
          if (updatedPlayer1.deck.length > 0) {
            const drawnOppCard = updatedPlayer1.deck.shift();
            if (drawnOppCard) {
              let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
              if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
              if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
              if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
                 if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
              }
              
              if (oppTargetRow === 'discard') {
                updatedPlayer1.graveyard.push(drawnOppCard);
              } else if (oppTargetRow === 'scenario') {
                if (updatedPlayer1.board.scenario) updatedPlayer1.graveyard.push(updatedPlayer1.board.scenario);
                if (newBoard.scenario) {
                  newGraveyard.push(newBoard.scenario);
                  newBoard.scenario = null;
                }
                updatedPlayer1.board.scenario = drawnOppCard;
              } else {
                let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
                if (oppIsSpy) {
                  newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
                } else {
                  updatedPlayer1.board[oppTargetRow] = [...(updatedPlayer1.board[oppTargetRow] || []), drawnOppCard];
                }
              }
            }
          } else if (updatedPlayer1.hand.length > 0) {
            const randomIndex = Math.floor(Math.random() * updatedPlayer1.hand.length);
            const drawnOppCard = updatedPlayer1.hand.splice(randomIndex, 1)[0];
            if (drawnOppCard) {
              let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
              if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
              if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
              if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
                 if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
              }
              
              if (oppTargetRow === 'discard') {
                updatedPlayer1.graveyard.push(drawnOppCard);
              } else if (oppTargetRow === 'scenario') {
                if (updatedPlayer1.board.scenario) updatedPlayer1.graveyard.push(updatedPlayer1.board.scenario);
                if (newBoard.scenario) {
                  newGraveyard.push(newBoard.scenario);
                  newBoard.scenario = null;
                }
                updatedPlayer1.board.scenario = drawnOppCard;
              } else {
                let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
                if (oppIsSpy) {
                  newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
                } else {
                  updatedPlayer1.board[oppTargetRow] = [...(updatedPlayer1.board[oppTargetRow] || []), drawnOppCard];
                }
              }
            }
          }
        }
    
    if (isAssassinSpy && updatedPlayer1) {`;

if (code.includes(botPlayAnchor)) {
  code = code.replace(botPlayAnchor, botPlayInsert);
  fs.writeFileSync('src/pages/GameBoard.tsx', code);
  console.log('Success bot insert');
} else {
  console.log('Failed bot insert');
}
