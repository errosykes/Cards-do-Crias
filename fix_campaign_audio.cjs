const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  'const startSpecificBotMatch = async (diff: string, customDeck: Card[], botName: string, botProfile?: any) => {',
  'const startSpecificBotMatch = async (diff: string, customDeck: Card[], botName: string, botProfile?: any, campaignId?: string) => {'
);

code = code.replace(
  "        botDifficulty: diff\n      };",
  "        botDifficulty: diff,\n        campaignId: campaignId || null\n      };"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);

let tab = fs.readFileSync('src/components/TournamentTab.tsx', 'utf-8');

tab = tab.replace(
  'startSpecificBotMatch: (diff: string, customDeck: Card[], botName: string, botProfile?: any) => void;',
  'startSpecificBotMatch: (diff: string, customDeck: Card[], botName: string, botProfile?: any, campaignId?: string) => void;'
);

tab = tab.replace(
  "startSpecificBotMatch(npc.diff, deck, npc.name, { avatarUrl: npc.imageUrl, coverUrl: npc.backgroundUrl });",
  "startSpecificBotMatch(npc.diff, deck, npc.name, { avatarUrl: npc.imageUrl, coverUrl: npc.backgroundUrl }, npc.campaignId || 'tournament-1');"
);

fs.writeFileSync('src/components/TournamentTab.tsx', tab);

let game = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

game = game.replace(
  "if (gameState?.isBotMatch) {",
  "if (gameState?.isBotMatch) {\n        if (gameState?.campaignId && config.campaignMusic?.[gameState.campaignId]) {\n            setCurrentTrack(config.campaignMusic[gameState.campaignId]);\n        } else if (config.battleMusic) {\n            setCurrentTrack(config.battleMusic);\n        }"
);
game = game.replace(
  "// Just default battleMusic for bot matches\n        if (config.battleMusic) setCurrentTrack(config.battleMusic);",
  ""
);

fs.writeFileSync('src/pages/GameBoard.tsx', game);
console.log('Fixed campaign audio');
