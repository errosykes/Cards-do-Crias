const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  "eventLogs.push(`${me.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);",
  "eventLogs.push(`${me.username} usou Ladrão e roubou a carta ${stolenCard.name} da mão do adversário.`);"
);

gb = gb.replace(
  "eventLogs.push(`${botState.username} usou Ladrão e roubou uma carta aleatória da mão do adversário.`);",
  "eventLogs.push(`${botState.username} usou Ladrão e roubou a carta ${stolenCard.name} da mão do adversário.`);"
);

gb = gb.replace(
  "eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou uma carta aleatória da mão do adversário.`);",
  "eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou a carta ${stolenCard.name} da mão do adversário.`);"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed thief logs');
