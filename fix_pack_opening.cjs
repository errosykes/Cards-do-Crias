const fs = require('fs');
let code = fs.readFileSync('src/pages/Store.tsx', 'utf-8');

// Fix the animation for opening pack
code = code.replace(
  /className="relative w-48 h-64 md:w-64 md:h-80 bg-\[#3d3326\] border-4 border-yellow-600 rounded-xl flex items-center justify-center shadow-\[0_0_50px_rgba\(202,138,4,0\.5\)\] overflow-hidden"/g,
  'className="relative w-48 h-64 md:w-64 md:h-80 bg-[#3d3326] rounded-xl flex items-center justify-center shadow-[0_0_50px_rgba(202,138,4,0.5)] overflow-hidden"'
);

code = code.replace(
  /className="absolute inset-0 bg-\[#3d3326\] border-4 border-yellow-600 rounded-xl shadow-\[0_0_50px_rgba\(202,138,4,0\.8\)\] overflow-hidden"/g,
  'className="absolute inset-0 bg-[#3d3326] rounded-xl shadow-[0_0_50px_rgba(202,138,4,0.8)] overflow-hidden"'
);

code = code.replace(
  /<img src=\{openingPack\.imageUrl\} alt="Pack" className="absolute inset-0 w-full h-full object-cover opacity-50" \/>/g,
  '<img src={openingPack.imageUrl} alt="Pack" className="absolute inset-0 w-full h-full object-cover" />'
);

code = code.replace(
  /<PackageOpen className="w-20 h-20 text-yellow-500 animate-pulse relative z-10" \/>/g,
  ''
);

fs.writeFileSync('src/pages/Store.tsx', code);
console.log('Fixed pack opening visuals');
