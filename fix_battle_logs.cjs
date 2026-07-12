const fs = require('fs');

let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  "const updateData: any = {};\n    const logMsg = playedCard.type === 'Trap' ? `${me.username} jogou uma carta Trap virada para baixo.` : `${me.username} jogou a carta ${card.name}.`;\n    updateData.battleLog = arrayUnion(logMsg);",
  "const updateData: any = {};\n    const eventLogs: string[] = [];\n    eventLogs.push(playedCard.type === 'Trap' ? `${me.username} jogou uma carta Trap virada para baixo.` : `${me.username} jogou a carta ${card.name}.`);"
);

// We need to add effects to eventLogs for non-trap cards
gb = gb.replace(
  "if (isAssassinSpy && updatedOpponent && targetEnemyCard) {\n      let destroyed = false;",
  "if (isAssassinSpy && updatedOpponent && targetEnemyCard) {\n      let destroyed = false;\n      eventLogs.push(`${me.username} usou Espião Assassino e tentou destruir ${targetEnemyCard.name}.`);"
);

gb = gb.replace(
  "if (isThief && updatedOpponent) {\n      if (updatedOpponent.hand.length > 0) {\n        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);\n        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];\n        newHand.push(stolenCard);",
  "if (isThief && updatedOpponent) {\n      if (updatedOpponent.hand.length > 0) {\n        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);\n        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];\n        newHand.push(stolenCard);\n        eventLogs.push(`${me.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);"
);

gb = gb.replace(
  "if (isMedic && newGraveyard.length > 0) {\n      const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));\n      if (revivable.length > 0) {\n        revivable.sort((a, b) => (b.points || 0) - (a.points || 0));\n        const revivedCard = revivable[0];\n        newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);\n        newHand.push(revivedCard);\n      }",
  "if (isMedic && newGraveyard.length > 0) {\n      const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));\n      if (revivable.length > 0) {\n        revivable.sort((a, b) => (b.points || 0) - (a.points || 0));\n        const revivedCard = revivable[0];\n        newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);\n        newHand.push(revivedCard);\n        eventLogs.push(`${me.username} usou Médico e reviveu ${revivedCard.name} do cemitério.`);\n      }"
);

gb = gb.replace(
  "if (isDinheiroJuros && updatedOpponent) {\n      if (updatedOpponent.deck.length > 0) {\n        const drawnOppCard = updatedOpponent.deck.shift();",
  "if (isDinheiroJuros && updatedOpponent) {\n      if (updatedOpponent.deck.length > 0) {\n        const drawnOppCard = updatedOpponent.deck.shift();\n        if (drawnOppCard) eventLogs.push(`${me.username} usou Dinheiro a Juros. O adversário foi forçado a jogar ${drawnOppCard.name} do topo do baralho.`);"
);

gb = gb.replace(
  "if (isScorch) {\n      const pMeleeBuffs",
  "if (isScorch) {\n      eventLogs.push(`${me.username} usou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói do campo.`);\n      const pMeleeBuffs"
);

gb = gb.replace(
  "for (let i = 0; i < shouldDraw; i++) {\n          if (newDeck.length > 0) {\n            const drawn = newDeck.shift();\n            if (drawn) newHand.push(drawn);\n          }\n        }",
  "for (let i = 0; i < shouldDraw; i++) {\n          if (newDeck.length > 0) {\n            const drawn = newDeck.shift();\n            if (drawn) newHand.push(drawn);\n          }\n        }\n        if (shouldDraw > 0) eventLogs.push(`${me.username} comprou ${shouldDraw} carta(s).`);"
);

gb = gb.replace(
  "updateData['player2.hand'] = newHand;\n        updateData['player2.board'] = newBoard;",
  "updateData['player2.hand'] = newHand;\n        updateData['player2.board'] = newBoard;\n        if (eventLogs && eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }"
);

gb = gb.replace(
  "updateData[`${opponentKey}.deck`] = updatedOpponent.deck;\n    }\n        \n    updateData.turn = nextTurn;",
  "updateData[`${opponentKey}.deck`] = updatedOpponent.deck;\n    }\n        \n    updateData.turn = nextTurn;\n    if (eventLogs && eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }"
);


// Now for activateTrap:
gb = gb.replace(
  "const activateTrap = async (card: Card, owner: 'me' | 'opponent', targetRow: 'melee' | 'ranged' | 'scenario') => {\n    if (!userData || !gameState || !gameId) return;\n\n    if (owner !== 'me') return; // Can only flip own traps\n\n    let newBoard = { ...me.board };",
  "const activateTrap = async (card: Card, owner: 'me' | 'opponent', targetRow: 'melee' | 'ranged' | 'scenario') => {\n    if (!userData || !gameState || !gameId) return;\n\n    if (owner !== 'me') return; // Can only flip own traps\n    const eventLogs: string[] = [];\n    eventLogs.push(`${me.username} ativou a carta Trap: ${card.name}.`);\n\n    let newBoard = { ...me.board };"
);

gb = gb.replace(
  "if (isAssassinSpy && updatedOpponent) {\n      let highestPts = -1;",
  "if (isAssassinSpy && updatedOpponent) {\n      eventLogs.push(`${me.username} (Trap) ativou Espião Assassino, tentando destruir a carta mais forte do adversário.`);\n      let highestPts = -1;"
);

gb = gb.replace(
  "if (isThief && updatedOpponent) {\n      if (updatedOpponent.hand.length > 0) {\n        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);\n        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];\n        newHand.push(stolenCard);",
  "if (isThief && updatedOpponent) {\n      if (updatedOpponent.hand.length > 0) {\n        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);\n        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];\n        newHand.push(stolenCard);\n        eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou uma carta aleatória da mão do adversário.`);"
);

gb = gb.replace(
  "if (isDinheiroJuros && updatedOpponent) {\n      if (updatedOpponent.deck.length > 0) {\n        const drawnOppCard = updatedOpponent.deck.shift();",
  "if (isDinheiroJuros && updatedOpponent) {\n      if (updatedOpponent.deck.length > 0) {\n        const drawnOppCard = updatedOpponent.deck.shift();\n        if (drawnOppCard) eventLogs.push(`${me.username} (Trap) ativou Dinheiro a Juros. O adversário jogou ${drawnOppCard.name} do topo do baralho.`);"
);

gb = gb.replace(
  "// Apply effects\n    let isScorch = card.effects?.includes('Queimar');",
  "// Apply effects\n    let isScorch = card.effects?.includes('Queimar');\n    if (isScorch) eventLogs.push(`${me.username} (Trap) ativou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói.`);"
);

gb = gb.replace(
  "for (let i = 0; i < shouldDraw; i++) {\n      if (newDeck.length > 0) {\n        newHand.push(newDeck.shift()!);\n      }\n    }",
  "for (let i = 0; i < shouldDraw; i++) {\n      if (newDeck.length > 0) {\n        newHand.push(newDeck.shift()!);\n      }\n    }\n    if (shouldDraw > 0) eventLogs.push(`${me.username} (Trap) comprou ${shouldDraw} carta(s).`);"
);

gb = gb.replace(
  "    const updateData: any = {\n      [`${playerKey}.board`]: newBoard,",
  "    const updateData: any = {\n      [`${playerKey}.board`]: newBoard,"
);

gb = gb.replace(
  "updateData[`${opponentKey}.graveyard`] = updatedOpponent.graveyard;\n    }\n    try {",
  "updateData[`${opponentKey}.graveyard`] = updatedOpponent.graveyard;\n    }\n    if (eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }\n    try {"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Done battle logs modification');
