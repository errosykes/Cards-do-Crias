const fs = require('fs');
const content = fs.readFileSync('src/pages/GameBoard.tsx', 'utf8');

let b = 0;
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') b++;
    if (line[j] === '}') b--;
  }
  if (i > 380 && i < 415) console.log(i+1, b, line);
  // if (i > 580 && i < 620) console.log(i+1, b, line);
}
