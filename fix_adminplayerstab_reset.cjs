const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(
  'console.log("Success");\n      fetchPlayers();',
  'console.log("Success");\n      setResetConfirm(null);\n      fetchPlayers();'
);

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed Reset Confirm state reset');
