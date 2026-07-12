const fs = require('fs');
let code = fs.readFileSync('src/components/CardModal.tsx', 'utf-8');

code = code.replace(
  /\{EFFECT_DESCRIPTIONS\[eff\] \|\| ''\}/g,
  "{EFFECT_DESCRIPTIONS[eff] || 'Efeito sem descrição.'}"
);

fs.writeFileSync('src/components/CardModal.tsx', code);
console.log('Fixed CardModal');
