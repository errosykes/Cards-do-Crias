const fs = require('fs');
let code = fs.readFileSync('src/lib/botAI.ts', 'utf-8');

const anchor = `    row.forEach(c => {
      if (c.effects?.includes('Herói')) {`;

const insert = `    row.forEach(c => {
      if (c.isFacedown) return;
      if (c.effects?.includes('Herói')) {`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/lib/botAI.ts', code);
console.log('Success botAI getRowScore');
