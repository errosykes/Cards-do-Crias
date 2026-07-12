const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  /{renderCard\(opponent\.board\.scenario, 'opp-scen'\)}/g,
  "{renderCard(opponent.board.scenario, 'opp-scen', opponent.board.scenario.isFacedown ? () => activateTrap(opponent.board.scenario!, 'opponent', 'scenario') : undefined)}"
);

code = code.replace(
  /{renderCard\(me\.board\.scenario, 'me-scen'\)}/g,
  "{renderCard(me.board.scenario, 'me-scen', me.board.scenario.isFacedown ? () => activateTrap(me.board.scenario!, 'me', 'scenario') : undefined)}"
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success scenario trap');
