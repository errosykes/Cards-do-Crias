const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

code = code.replace(
  "{selectedCardModal && (",
  "{showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}\n      {selectedCardModal && ("
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
console.log('Fixed Dashboard with audio Modal');
