const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(
  /showMessage\("Erro ao executar ação!"\);\n      setResetConfirm\(null\);/g,
  'showMessage("Conta resetada com sucesso!");\n      setResetConfirm(null);'
);

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed reset message');
