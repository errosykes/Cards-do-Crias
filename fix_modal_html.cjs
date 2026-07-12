const fs = require('fs');
let code = fs.readFileSync('src/components/HowToPlayModal.tsx', 'utf-8');

code = code.replace(
  /<div className="bg-black\/30 p-3 rounded border border-\[#3d3326\]">\s*<div className="bg-black\/30 p-3 rounded border border-\[#3d3326\]">/g,
  '<div className="bg-black/30 p-3 rounded border border-[#3d3326]">'
);

fs.writeFileSync('src/components/HowToPlayModal.tsx', code);
console.log('Fixed HowToPlayModal HTML');
