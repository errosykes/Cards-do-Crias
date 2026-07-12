const fs = require('fs');
let code = fs.readFileSync('src/lib/sound.ts', 'utf-8');

code = code.replace(
  'gainNode.gain.setValueAtTime(0.05, this.audioCtx.currentTime);',
  'const vol = parseFloat(localStorage.getItem("sfxVolume") || "0.5");\n      gainNode.gain.setValueAtTime(0.05 * vol, this.audioCtx.currentTime);'
);
code = code.replace(
  'gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);',
  'gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, this.audioCtx.currentTime + 0.05);'
);

code = code.replace(
  'gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime);',
  'const vol = parseFloat(localStorage.getItem("sfxVolume") || "0.5");\n      gainNode.gain.setValueAtTime(0.1 * vol, this.audioCtx.currentTime);'
);
code = code.replace(
  'gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);',
  'gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, this.audioCtx.currentTime + 0.1);'
);

code = code.replace(
  /gainNode.gain.linearRampToValueAtTime\(0.1, t \+ i \* 0.15 \+ 0.05\);/g,
  'const vol = parseFloat(localStorage.getItem("sfxVolume") || "0.5");\n        gainNode.gain.linearRampToValueAtTime(0.1 * vol, t + i * 0.15 + 0.05);'
);
code = code.replace(
  /gainNode.gain.exponentialRampToValueAtTime\(0.01, t \+ i \* 0.15 \+ 0.4\);/g,
  'gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, t + i * 0.15 + 0.4);'
);

code = code.replace(
  /gainNode.gain.linearRampToValueAtTime\(0.1, t \+ i \* 0.3 \+ 0.05\);/g,
  'const vol = parseFloat(localStorage.getItem("sfxVolume") || "0.5");\n        gainNode.gain.linearRampToValueAtTime(0.1 * vol, t + i * 0.3 + 0.05);'
);
code = code.replace(
  /gainNode.gain.exponentialRampToValueAtTime\(0.01, t \+ i \* 0.3 \+ 0.5\);/g,
  'gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, t + i * 0.3 + 0.5);'
);

code = code.replace(
  /gainNode.gain.linearRampToValueAtTime\(0.1, t \+ i \* 0.4 \+ 0.1\);/g,
  'const vol = parseFloat(localStorage.getItem("sfxVolume") || "0.5");\n        gainNode.gain.linearRampToValueAtTime(0.1 * vol, t + i * 0.4 + 0.1);'
);
code = code.replace(
  /gainNode.gain.exponentialRampToValueAtTime\(0.01, t \+ i \* 0.4 \+ 0.3\);/g,
  'gainNode.gain.exponentialRampToValueAtTime(0.01 * vol, t + i * 0.4 + 0.3);'
);

fs.writeFileSync('src/lib/sound.ts', code);
console.log('Fixed sound volume scaling');
