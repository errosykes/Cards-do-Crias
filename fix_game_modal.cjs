const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

code = code.replace(
  '{selectedCardModal && (',
  '{showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}\n      {selectedCardModal && ('
);

fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Fixed GameBoard Modal');
