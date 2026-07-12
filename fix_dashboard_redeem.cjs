const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const anchor = `      await loadAllCards();
      const cardCode = cardCodeInput.trim();
      const cachedCard = getCachedCard(cardCode);`;

const replace = `      await loadAllCards(true); // Force reload to ensure new cards are fetched
      const cardCode = cardCodeInput.trim();
      const cachedCard = getCachedCard(cardCode);`;

code = code.replace(anchor, replace);
fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed redeem reload');
