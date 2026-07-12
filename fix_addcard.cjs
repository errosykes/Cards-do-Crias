const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(
  /const cardId = cardIdInput\.value;/,
  'const cardId = cardIdInput.value.trim();'
);

code = code.replace(
  /const cardId = cardIdInput\.value;/,
  'const cardId = cardIdInput.value.trim();'
); // for handleRemoveCard

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed trim for cardId');
