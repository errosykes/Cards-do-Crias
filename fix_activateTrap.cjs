const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = /const activateTrap = async[\s\S]*?\} catch\(e\) \{[\s\S]*?\};/;

const replacement = `const activateTrap = async (card: Card, owner: 'me' | 'opponent', targetRow: 'melee' | 'ranged' | 'scenario') => {
    if (!userData || !gameState || !gameId) return;

    if (owner !== 'me') return; // Can only flip own traps

    let newBoard = { ...me.board };
    let newHand = [...me.hand];
    let newDeck = [...(me.deck || [])];
    let newGraveyard = [...(me.graveyard || [])];

    let updatedOpponent = opponent ? { 
      ...opponent, 
      board: { ...opponent.board }, 
      graveyard: [...(opponent.graveyard || [])], 
      hand: [...opponent.hand], 
      deck: [...opponent.deck] 
    } : null;

    // Find and flip the card in the correct row
    if (targetRow === 'scenario') {
      if (newBoard.scenario && newBoard.scenario.id === card.id) {
        newBoard.scenario = { ...newBoard.scenario, isFacedown: false };
      }
    } else {
      newBoard[targetRow] = newBoard[targetRow].map((c: Card) => {
        if (c.id === card.id && c.isFacedown) {
          return { ...c, isFacedown: false };
        }
        return c;
      });
    }

    // Apply effects
    let isScorch = card.effects?.includes('Queimar');
    let isThief = card.effects?.includes('Ladrão');
    let isDinheiroJuros = card.effects?.includes('Dinheiro a Juros');
    
    let shouldDraw = 0;
    if (card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (card.effects?.includes('Comprar 2')) shouldDraw += 2;

    if (isThief && updatedOpponent) {
      if (updatedOpponent.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);
        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];
        newHand.push(stolenCard);
      }
    }

    if (isDinheiroJuros && updatedOpponent) {
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
            let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão');
            if (oppIsSpy) {
              newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
            } else {
              updatedOpponent.board[oppTargetRow] = [...(updatedOpponent.board[oppTargetRow] || []), drawnOppCard];
            }
          }
        }
      }
    }

    if (isScorch) {
      const pMeleeBuffs = countGlobalBuff(newBoard, 'Buff de área melee');
      const pRangedBuffs = countGlobalBuff(newBoard, 'Buff de área ranged');
      const oMeleeBuffs = countGlobalBuff(updatedOpponent?.board, 'Buff de área melee');
      const oRangedBuffs = countGlobalBuff(updatedOpponent?.board, 'Buff de área ranged');
      
      const pMeleeTraps = countGlobalBuff(newBoard, 'Trap campo melee');
      const pRangedTraps = countGlobalBuff(newBoard, 'Trap campo Ranged');
      const oMeleeTraps = countGlobalBuff(updatedOpponent?.board, 'Trap campo melee');
      const oRangedTraps = countGlobalBuff(updatedOpponent?.board, 'Trap campo Ranged');
      
      const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
      const globalRangedBuffs = pRangedBuffs + oRangedBuffs;
      const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
      const globalRangedTraps = pRangedTraps + oRangedTraps;

      const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);

      let highestPoints = -1;
      
      newBoard.melee.forEach(c => {
        const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedOpponent?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      newBoard.ranged.forEach(c => {
        const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedOpponent?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      if (updatedOpponent) {
        updatedOpponent.board.melee.forEach(c => {
          const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
        updatedOpponent.board.ranged.forEach(c => {
          const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
      }

      if (highestPoints > 0) {
        newBoard.melee = newBoard.melee.filter(c => {
          const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedOpponent?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        newBoard.ranged = newBoard.ranged.filter(c => {
          const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedOpponent?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        if (updatedOpponent) {
          updatedOpponent.board.melee = updatedOpponent.board.melee.filter(c => {
            const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedOpponent.graveyard.push(c);
              return false;
            }
            return true;
          });
          updatedOpponent.board.ranged = updatedOpponent.board.ranged.filter(c => {
            const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedOpponent.graveyard.push(c);
              return false;
            }
            return true;
          });
        }
      }
    }

    for (let i = 0; i < shouldDraw; i++) {
      if (newDeck.length > 0) {
        newHand.push(newDeck.shift()!);
      }
    }

    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const opponentKey = isPlayer1 ? 'player2' : 'player1';

    const updateData: any = {
      [\`\${playerKey}.board\`]: newBoard,
      [\`\${playerKey}.hand\`]: newHand,
      [\`\${playerKey}.deck\`]: newDeck,
      [\`\${playerKey}.graveyard\`]: newGraveyard
    };

    if (updatedOpponent) {
      updateData[\`\${opponentKey}.board\`] = updatedOpponent.board;
      updateData[\`\${opponentKey}.hand\`] = updatedOpponent.hand;
      updateData[\`\${opponentKey}.deck\`] = updatedOpponent.deck;
      updateData[\`\${opponentKey}.graveyard\`] = updatedOpponent.graveyard;
    }

    try {
      soundManager.playCardPlay(); // Play sound when flipped
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await updateDoc(doc(db, 'games', gameId), updateData);
    } catch(e) {
      console.error(e);
    }
  };`;

code = code.replace(anchor, replacement);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success activateTrap updated');
