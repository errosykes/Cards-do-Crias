const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  'chatMessages?: ChatMessage[];',
  'chatMessages?: ChatMessage[];\n  battleLog?: string[];'
);

fs.writeFileSync('src/types.ts', code);
console.log('Added battleLog to types');
