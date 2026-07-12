const fs = require('fs');

let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

// The thief in playCard currently looks like:
//         newHand.push(stolenCard);
//         eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou uma carta aleatória da mão do adversário.`);
//         eventLogs.push(`${me.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);

gb = gb.replace(
  "        newHand.push(stolenCard);\n        eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou uma carta aleatória da mão do adversário.`);\n        eventLogs.push(`${me.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);",
  "        newHand.push(stolenCard);\n        eventLogs.push(`${me.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);"
);

// The thief in activateTrap currently looks like:
//     if (isThief && updatedOpponent) {
//       if (updatedOpponent.hand.length > 0) {
//         const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);
//         const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];
//         newHand.push(stolenCard);
//       }
//     }

gb = gb.replace(
  "    if (isThief && updatedOpponent) {\n      if (updatedOpponent.hand.length > 0) {\n        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);\n        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];\n        newHand.push(stolenCard);\n      }\n    }",
  "    if (isThief && updatedOpponent) {\n      if (updatedOpponent.hand.length > 0) {\n        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);\n        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];\n        newHand.push(stolenCard);\n        eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou uma carta aleatória da mão do adversário.`);\n      }\n    }"
);

// Dinheiro a Juros in playCard:
//         const drawnOppCard = updatedOpponent.deck.shift();
//         if (drawnOppCard) eventLogs.push(`${me.username} (Trap) ativou Dinheiro a Juros. O adversário jogou ${drawnOppCard.name} do topo do baralho.`);
//         if (drawnOppCard) eventLogs.push(`${me.username} usou Dinheiro a Juros. O adversário foi forçado a jogar ${drawnOppCard.name} do topo do baralho.`);

gb = gb.replace(
  "        const drawnOppCard = updatedOpponent.deck.shift();\n        if (drawnOppCard) eventLogs.push(`${me.username} (Trap) ativou Dinheiro a Juros. O adversário jogou ${drawnOppCard.name} do topo do baralho.`);\n        if (drawnOppCard) eventLogs.push(`${me.username} usou Dinheiro a Juros. O adversário foi forçado a jogar ${drawnOppCard.name} do topo do baralho.`);",
  "        const drawnOppCard = updatedOpponent.deck.shift();\n        if (drawnOppCard) eventLogs.push(`${me.username} usou Dinheiro a Juros. O adversário foi forçado a jogar ${drawnOppCard.name} do topo do baralho.`);"
);

// Dinheiro a juros in activateTrap:
//     if (isDinheiroJuros && updatedOpponent) {
//       if (updatedOpponent.deck.length > 0) {
//         const drawnOppCard = updatedOpponent.deck.shift();

gb = gb.replace(
  "    if (isDinheiroJuros && updatedOpponent) {\n      if (updatedOpponent.deck.length > 0) {\n        const drawnOppCard = updatedOpponent.deck.shift();\n        if (drawnOppCard) {\n          let oppTargetRow",
  "    if (isDinheiroJuros && updatedOpponent) {\n      if (updatedOpponent.deck.length > 0) {\n        const drawnOppCard = updatedOpponent.deck.shift();\n        if (drawnOppCard) eventLogs.push(`${me.username} (Trap) ativou Dinheiro a Juros. O adversário jogou ${drawnOppCard.name} do topo do baralho.`);\n        if (drawnOppCard) {\n          let oppTargetRow"
);

// Scorch in playCard:
//     if (isScorch) {
//       eventLogs.push(`${me.username} (Trap) ativou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói.`);
//       eventLogs.push(`${me.username} usou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói do campo.`);
//       const pMeleeBuffs

gb = gb.replace(
  "    if (isScorch) {\n      eventLogs.push(`${me.username} (Trap) ativou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói.`);\n      eventLogs.push(`${me.username} usou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói do campo.`);\n      const pMeleeBuffs",
  "    if (isScorch) {\n      eventLogs.push(`${me.username} usou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói do campo.`);\n      const pMeleeBuffs"
);

// Scorch in activateTrap:
//     // Apply effects
//     let isScorch = card.effects?.includes('Queimar');
//     if (isScorch) {

gb = gb.replace(
  "    // Apply effects\n    let isScorch = card.effects?.includes('Queimar');\n    if (isScorch) {\n      const pMeleeBuffs",
  "    // Apply effects\n    let isScorch = card.effects?.includes('Queimar');\n    if (isScorch) eventLogs.push(`${me.username} (Trap) ativou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói.`);\n    if (isScorch) {\n      const pMeleeBuffs"
);

// Draw cards in playCard:
//     for (let i = 0; i < shouldDraw; i++) {
//       if (newDeck.length > 0) {
//         const drawn = newDeck.shift();
//         if (drawn) newHand.push(drawn);
//       }
//     }
//     if (shouldDraw > 0) eventLogs.push(`${me.username} (Trap) comprou ${shouldDraw} carta(s).`);
//     if (shouldDraw > 0) eventLogs.push(`${me.username} comprou ${shouldDraw} carta(s).`);

gb = gb.replace(
  "    for (let i = 0; i < shouldDraw; i++) {\n      if (newDeck.length > 0) {\n        const drawn = newDeck.shift();\n        if (drawn) newHand.push(drawn);\n      }\n    }\n    if (shouldDraw > 0) eventLogs.push(`${me.username} (Trap) comprou ${shouldDraw} carta(s).`);\n    if (shouldDraw > 0) eventLogs.push(`${me.username} comprou ${shouldDraw} carta(s).`);",
  "    for (let i = 0; i < shouldDraw; i++) {\n      if (newDeck.length > 0) {\n        const drawn = newDeck.shift();\n        if (drawn) newHand.push(drawn);\n      }\n    }\n    if (shouldDraw > 0) eventLogs.push(`${me.username} comprou ${shouldDraw} carta(s).`);"
);

// Draw cards in activateTrap:
//     for (let i = 0; i < shouldDraw; i++) {
//       if (newDeck.length > 0) {
//         newHand.push(newDeck.shift()!);
//       }
//     }
//     const playerKey = isPlayer1 ? 'player1' : 'player2';

gb = gb.replace(
  "    for (let i = 0; i < shouldDraw; i++) {\n      if (newDeck.length > 0) {\n        newHand.push(newDeck.shift()!);\n      }\n    }\n    const playerKey = isPlayer1 ? 'player1' : 'player2';",
  "    for (let i = 0; i < shouldDraw; i++) {\n      if (newDeck.length > 0) {\n        newHand.push(newDeck.shift()!);\n      }\n    }\n    if (shouldDraw > 0) eventLogs.push(`${me.username} (Trap) comprou ${shouldDraw} carta(s).`);\n    const playerKey = isPlayer1 ? 'player1' : 'player2';"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed messing up the file');
