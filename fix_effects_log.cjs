const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

// Bot Ladrão log
gb = gb.replace(
  "                if (cardToPlay.effects?.includes('Ladrão') && updatedPlayer1) {\n          if (updatedPlayer1.hand.length > 0) {\n            const randomIndex = Math.floor(Math.random() * updatedPlayer1.hand.length);\n            const stolenCard = updatedPlayer1.hand.splice(randomIndex, 1)[0];\n            newHand.push(stolenCard);\n          }",
  "                if (cardToPlay.effects?.includes('Ladrão') && updatedPlayer1) {\n          if (updatedPlayer1.hand.length > 0) {\n            const randomIndex = Math.floor(Math.random() * updatedPlayer1.hand.length);\n            const stolenCard = updatedPlayer1.hand.splice(randomIndex, 1)[0];\n            newHand.push(stolenCard);\n            eventLogs.push(`${botState.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);\n          }"
);

// Human Generic Effect Log
gb = gb.replace(
  "    eventLogs.push(playedCard.type === 'Trap' ? `${me.username} jogou uma carta Trap virada para baixo.` : `${me.username} jogou a carta ${card.name}.`);",
  "    eventLogs.push(playedCard.type === 'Trap' ? `${me.username} jogou uma carta Trap virada para baixo.` : `${me.username} jogou a carta ${card.name}.`);\n    if (playedCard.type !== 'Trap' && playedCard.effects && playedCard.effects.length > 0) { eventLogs.push(`${me.username} ativou: ${playedCard.effects.join(', ')}`); }"
);

// Bot Generic Effect Log
gb = gb.replace(
  "        eventLogs.push(cardToPlay.type === 'Trap' ? `${botState.username} jogou uma carta Trap virada para baixo.` : `${botState.username} jogou a carta ${cardToPlay.name}.`);\n        let targetRow:",
  "        eventLogs.push(cardToPlay.type === 'Trap' ? `${botState.username} jogou uma carta Trap virada para baixo.` : `${botState.username} jogou a carta ${cardToPlay.name}.`);\n        if (cardToPlay.type !== 'Trap' && cardToPlay.effects && cardToPlay.effects.length > 0) { eventLogs.push(`${botState.username} ativou: ${cardToPlay.effects.join(', ')}`); }\n        let targetRow:"
);

// Trap Generic Effect Log
gb = gb.replace(
  "    eventLogs.push(`${me.username} ativou a carta Trap: ${card.name}.`);\n\n    let newBoard",
  "    eventLogs.push(`${me.username} ativou a carta Trap: ${card.name}.`);\n    if (card.effects && card.effects.length > 0) { eventLogs.push(`${me.username} ativou: ${card.effects.join(', ')}`); }\n\n    let newBoard"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed generic logs');
