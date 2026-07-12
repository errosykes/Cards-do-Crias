const fs = require('fs');
let code = fs.readFileSync('src/components/AdminPlayersTab.tsx', 'utf-8');

code = code.replace(
  /console\.log\(`Removida\(s\) \$\{removed\} carta\(s\) do jogador \$\{player\.username\}`\);/g,
  'showMessage(`Removida(s) ${removed} carta(s) do jogador ${player.username}`);'
);

// also fix the "Liberar todas as cartas"
code = code.replace(
  /fetchPlayers\(\);\n                    \} catch \(e\) \{/g,
  'fetchPlayers();\n                       showMessage("Status de cartas atualizado com sucesso!");\n                    } catch (e) {'
);

fs.writeFileSync('src/components/AdminPlayersTab.tsx', code);
console.log('Fixed remove and release messages');
