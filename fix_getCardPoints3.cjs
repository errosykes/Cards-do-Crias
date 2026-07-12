const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor1 = `  if (card.effects?.includes('Vínculo Estreito')) {
    const sameCards = row.filter(c => c.name === card.name).length;
    pts = pts * sameCards;
  }`;

const insert1 = `  if (card.effects?.includes('Vínculo Estreito')) {
    const sameCards = row.filter(c => c.name === card.name && !c.isFacedown).length;
    pts = pts * sameCards;
  }`;

const anchor2 = `  if (!isHero) {
    const moraleBoosters = row.filter(c => c !== card && c.effects?.includes('Impulso Moral')).length;`;

const insert2 = `  if (!isHero) {
    const moraleBoosters = row.filter(c => c !== card && !c.isFacedown && c.effects?.includes('Impulso Moral')).length;`;

if (code.includes(anchor1)) {
  code = code.replace(anchor1, insert1);
  console.log('anchor1 success');
}

if (code.includes(anchor2)) {
  code = code.replace(anchor2, insert2);
  console.log('anchor2 success');
}

fs.writeFileSync('src/pages/GameBoard.tsx', code);
