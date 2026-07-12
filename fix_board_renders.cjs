const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  /<AnimatePresence>{opponent\?\.board\.ranged\.map\(\(c, idx\) => renderCard\(c, \`opp-r-\$\{c\.id\}-\$\{idx\}\`, targetingAssassinSpy && !c\.effects\?\.includes\('Herói'\) \? \(\) => handleTargetEnemy\(c\) : undefined, getCardPoints\(c, opponent\.board\.ranged, opponent\.board\.scenario, me\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards\)\)\)}<\/AnimatePresence>/g,
  "{/* updated opp ranged */}<AnimatePresence>{opponent?.board.ranged.map((c, idx) => renderCard(c, `opp-r-\${c.id}-\${idx}`, c.isFacedown ? () => activateTrap(c, 'opponent', 'ranged') : (targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined), getCardPoints(c, opponent.board.ranged, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
);

code = code.replace(
  /<AnimatePresence>{opponent\?\.board\.melee\.map\(\(c, idx\) => renderCard\(c, \`opp-m-\$\{c\.id\}-\$\{idx\}\`, targetingAssassinSpy && !c\.effects\?\.includes\('Herói'\) \? \(\) => handleTargetEnemy\(c\) : undefined, getCardPoints\(c, opponent\.board\.melee, opponent\.board\.scenario, me\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards\)\)\)}<\/AnimatePresence>/g,
  "{/* updated opp melee */}<AnimatePresence>{opponent?.board.melee.map((c, idx) => renderCard(c, `opp-m-\${c.id}-\${idx}`, c.isFacedown ? () => activateTrap(c, 'opponent', 'melee') : (targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined), getCardPoints(c, opponent.board.melee, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
);

code = code.replace(
  /<AnimatePresence>{me\?\.board\.melee\.map\(\(c, idx\) => renderCard\(c, \`me-m-\$\{c\.id\}-\$\{idx\}\`, undefined, getCardPoints\(c, me\.board\.melee, me\.board\.scenario, opponent\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards\)\)\)}<\/AnimatePresence>/g,
  "{/* updated me melee */}<AnimatePresence>{me?.board.melee.map((c, idx) => renderCard(c, `me-m-\${c.id}-\${idx}`, c.isFacedown ? () => activateTrap(c, 'me', 'melee') : undefined, getCardPoints(c, me.board.melee, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
);

code = code.replace(
  /<AnimatePresence>{me\?\.board\.ranged\.map\(\(c, idx\) => renderCard\(c, \`me-r-\$\{c\.id\}-\$\{idx\}\`, undefined, getCardPoints\(c, me\.board\.ranged, me\.board\.scenario, opponent\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards\)\)\)}<\/AnimatePresence>/g,
  "{/* updated me ranged */}<AnimatePresence>{me?.board.ranged.map((c, idx) => renderCard(c, `me-r-\${c.id}-\${idx}`, c.isFacedown ? () => activateTrap(c, 'me', 'ranged') : undefined, getCardPoints(c, me.board.ranged, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success board render update');
