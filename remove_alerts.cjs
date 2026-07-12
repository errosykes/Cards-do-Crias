const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(/alert\([^)]+\);/g, 'console.log("Success");');
code = code.replace(/if \(!confirm\([^)]+\)\) return;/g, '');

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Removed alerts and confirms from AdminPlayersTab');
