const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor1 = `    if (isDinheiroJuros && updatedOpponent) {
      if (updatedOpponent.deck.length > 0) {
        const drawnOppCard = updatedOpponent.deck.shift();
        if (drawnOppCard) {
          let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
          if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
          if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
          if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
             if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
          }
          
          if (oppTargetRow === 'discard') {
            updatedOpponent.graveyard.push(drawnOppCard);
          } else if (oppTargetRow === 'scenario') {
            if (updatedOpponent.board.scenario) updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
            if (newBoard.scenario) {
              newGraveyard.push(newBoard.scenario);
              newBoard.scenario = null;
            }
            updatedOpponent.board.scenario = drawnOppCard;
          } else {
            let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
            if (oppIsSpy) {
              newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
            } else {
              updatedOpponent.board[oppTargetRow] = [...(updatedOpponent.board[oppTargetRow] || []), drawnOppCard];
            }
          }
        }
      }
    }`;

const insert1 = `    if (isDinheiroJuros && updatedOpponent) {
      if (updatedOpponent.deck.length > 0) {
        const drawnOppCard = updatedOpponent.deck.shift();
        if (drawnOppCard) {
          let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
          if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
          if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
          if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
             if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
          }
          
          if (oppTargetRow === 'discard') {
            updatedOpponent.graveyard.push(drawnOppCard);
          } else if (oppTargetRow === 'scenario') {
            if (updatedOpponent.board.scenario) updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
            if (newBoard.scenario) {
              newGraveyard.push(newBoard.scenario);
              newBoard.scenario = null;
            }
            updatedOpponent.board.scenario = drawnOppCard;
          } else {
            let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
            if (oppIsSpy) {
              newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
            } else {
              updatedOpponent.board[oppTargetRow] = [...(updatedOpponent.board[oppTargetRow] || []), drawnOppCard];
            }
          }
        }
      } else if (updatedOpponent.hand.length > 0) {
        // Player has no deck, take from hand
        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);
        const drawnOppCard = updatedOpponent.hand.splice(randomIndex, 1)[0];
        if (drawnOppCard) {
          let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
          if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
          if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
          if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
             if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
          }
          
          if (oppTargetRow === 'discard') {
            updatedOpponent.graveyard.push(drawnOppCard);
          } else if (oppTargetRow === 'scenario') {
            if (updatedOpponent.board.scenario) updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
            if (newBoard.scenario) {
              newGraveyard.push(newBoard.scenario);
              newBoard.scenario = null;
            }
            updatedOpponent.board.scenario = drawnOppCard;
          } else {
            let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
            if (oppIsSpy) {
              newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
            } else {
              updatedOpponent.board[oppTargetRow] = [...(updatedOpponent.board[oppTargetRow] || []), drawnOppCard];
            }
          }
        }
      }
    }`;

const anchor2 = `        if (isDinheiroJuros && updatedPlayer1) {
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
          }
        }`;

const insert2 = `        if (isDinheiroJuros && updatedPlayer1) {
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
        }`;

if (code.includes(anchor1)) {
  code = code.replace(anchor1, insert1);
  console.log('Replaced anchor1');
} else {
  console.log('Failed to replace anchor1');
}
if (code.includes(anchor2)) {
  code = code.replace(anchor2, insert2);
  console.log('Replaced anchor2');
} else {
  console.log('Failed to replace anchor2');
}

fs.writeFileSync('src/pages/GameBoard.tsx', code);
