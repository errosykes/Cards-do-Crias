const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(
  /console\.log\(`Adicionadas \$\{qty\} carta\(s\) ao jogador \$\{player\.username\}`\);/g,
  'showMessage(`Adicionadas ${qty} carta(s) ao jogador ${player.username}`);'
);

code = code.replace(
  /console\.log\(`Removidas \$\{removedCount\} carta\(s\) do jogador \$\{player\.username\}`\);/g,
  'showMessage(`Removidas ${removedCount} carta(s) do jogador ${player.username}`);'
);

code = code.replace(
  /showMessage\("Ação concluída com sucesso!"\);/g,
  'showMessage("Erro ao executar ação!");'
);

code = code.replace(
  /console\.log\(e\);\n\s*\}\n\s*\}\}/g,
  `console.error(e);\n                       showMessage("Erro");\n                    }\n                 }}`
);

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed admin messages');
