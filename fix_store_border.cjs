const fs = require('fs');
let code = fs.readFileSync('src/pages/Store.tsx', 'utf-8');

code = code.replace(
  'className="w-48 h-64 md:w-64 md:h-80 bg-[#3d3326] border-4 border-yellow-600 rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.8)] flex items-center justify-center relative overflow-hidden"',
  'className="w-48 h-64 md:w-64 md:h-80 bg-[#3d3326] rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.8)] flex items-center justify-center relative overflow-hidden"'
);

fs.writeFileSync('src/pages/Store.tsx', code);
console.log('Fixed border in store');
