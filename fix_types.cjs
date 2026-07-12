const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  'isBotMatch?: boolean;',
  'isBotMatch?: boolean;\n  campaignId?: string;'
);

fs.writeFileSync('src/types.ts', code);
console.log('Fixed types.ts');
