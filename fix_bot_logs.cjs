const fs = require('fs');

let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  "        const updateData: any = {};\n\n        const p1Score = gameState.player1.score || 0;",
  "        const updateData: any = {};\n        const eventLogs: string[] = [];\n\n        const p1Score = gameState.player1.score || 0;"
);

gb = gb.replace(
  "           updateData['player2.passed'] = true;\n           updateData.battleLog = arrayUnion(`${gameState.player2.username} passou o turno.`);\n           const nextTurn = gameState.player1.passed ? 'bot' : gameState.player1.uid;",
  "           updateData['player2.passed'] = true;\n           eventLogs.push(`${gameState.player2.username} passou o turno.`);\n           if (eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }\n           const nextTurn = gameState.player1.passed ? 'bot' : gameState.player1.uid;"
);

gb = gb.replace(
  "        let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';",
  "        eventLogs.push(cardToPlay.type === 'Trap' ? `${botState.username} jogou uma carta Trap virada para baixo.` : `${botState.username} jogou a carta ${cardToPlay.name}.`);\n        let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';"
);

gb = gb.replace(
  "        if (isAssassinSpy && updatedPlayer1) {\n          let highestPts = -1;\n          let targetCard: any = null;",
  "        if (isAssassinSpy && updatedPlayer1) {\n          eventLogs.push(`${botState.username} usou Espião Assassino e tentou destruir a carta mais forte.`);\n          let highestPts = -1;\n          let targetCard: any = null;"
);

gb = gb.replace(
  "        if (isMedic && newGraveyard.length > 0) {\n          const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));\n          if (revivable.length > 0) {\n            revivable.sort((a, b) => (b.points || 0) - (a.points || 0));\n            const revivedCard = revivable[0];\n            newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);\n            newHand.push(revivedCard);\n          }\n        }",
  "        if (isMedic && newGraveyard.length > 0) {\n          const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));\n          if (revivable.length > 0) {\n            revivable.sort((a, b) => (b.points || 0) - (a.points || 0));\n            const revivedCard = revivable[0];\n            newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);\n            newHand.push(revivedCard);\n            eventLogs.push(`${botState.username} usou Médico e reviveu ${revivedCard.name} do cemitério.`);\n          }\n        }"
);

gb = gb.replace(
  "    if (isDinheiroJuros && updatedPlayer1) {\n      if (updatedPlayer1.deck.length > 0) {\n        const drawnOppCard = updatedPlayer1.deck.shift();\n        if (drawnOppCard) {\n          let oppTargetRow",
  "    if (isDinheiroJuros && updatedPlayer1) {\n      if (updatedPlayer1.deck.length > 0) {\n        const drawnOppCard = updatedPlayer1.deck.shift();\n        if (drawnOppCard) eventLogs.push(`${botState.username} usou Dinheiro a Juros. O adversário foi forçado a jogar ${drawnOppCard.name} do topo do baralho.`);\n        if (drawnOppCard) {\n          let oppTargetRow"
);

gb = gb.replace(
  "        if (isScorch) {\n          const pMeleeBuffs",
  "        if (isScorch) {\n          eventLogs.push(`${botState.username} usou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói do campo.`);\n          const pMeleeBuffs"
);

gb = gb.replace(
  "        for (let i = 0; i < shouldDraw; i++) {\n          if (newDeck.length > 0) {\n            const drawn = newDeck.shift();\n            if (drawn) newHand.push(drawn);\n          }\n        }",
  "        for (let i = 0; i < shouldDraw; i++) {\n          if (newDeck.length > 0) {\n            const drawn = newDeck.shift();\n            if (drawn) newHand.push(drawn);\n          }\n        }\n        if (shouldDraw > 0) eventLogs.push(`${botState.username} comprou ${shouldDraw} carta(s).`);"
);

gb = gb.replace(
  "        updateData.turn = nextTurn;\n        \n        updateData.battleLog = arrayUnion(cardToPlay.type === 'Trap' ? `${botState.username} jogou uma carta Trap virada para baixo.` : `${botState.username} jogou a carta ${cardToPlay.name}.`);\n        await updateDoc(doc(db, 'games', gameId!), updateData);",
  "        updateData.turn = nextTurn;\n        \n        if (eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }\n        await updateDoc(doc(db, 'games', gameId!), updateData);"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed bot logs');
