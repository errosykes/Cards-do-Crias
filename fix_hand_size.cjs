const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  /w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40/g,
  'w-16 h-24 sm:w-24 sm:h-36 md:w-28 md:h-40'
);

gb = gb.replace(
  /<div className="h-32 md:h-48 border-t border-\[#3d3326\] bg-\[#0a0908\] p-2 md:p-4 overflow-x-auto overflow-y-hidden flex items-end justify-center gap-1 md:gap-2 snap-x">/g,
  '<div className="h-28 md:h-48 border-t border-[#3d3326] bg-[#0a0908] p-2 md:p-4 overflow-x-auto overflow-y-hidden flex items-end justify-center gap-1 md:gap-2 snap-x">'
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed hand size');
