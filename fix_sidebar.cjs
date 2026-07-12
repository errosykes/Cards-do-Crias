const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  '<div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col md:flex-row items-center justify-center md:justify-between shrink-0 w-24 md:w-auto gap-2">',
  '<div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col items-center justify-center shrink-0 w-24 md:w-auto gap-2">\n              <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-2 w-full">'
);

gb = gb.replace(
  '              <div className="text-center">\n                {gameState.status === \'finished\' ? (',
  '              </div>\n              <div className="text-center mt-2">\n                {gameState.status === \'finished\' ? ('
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed sidebar buttons');
