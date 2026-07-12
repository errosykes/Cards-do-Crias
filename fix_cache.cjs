const fs = require('fs');
let code = fs.readFileSync('src/lib/cardsCache.ts', 'utf-8');

// Change CACHE_TIME to 5 minutes
code = code.replace(
  /const CACHE_TIME = 24 \* 60 \* 60 \* 1000; \/\/ 24 hours/,
  'const CACHE_TIME = 5 * 60 * 1000; // 5 minutes'
);

// We should also make sure the user can force refresh.
// Actually, 5 minutes is fine. But even better, if we just want it to work right now.
fs.writeFileSync('src/lib/cardsCache.ts', code);
console.log('Fixed cache time');
