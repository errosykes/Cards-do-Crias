const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  '<span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Sair</span>',
  '<span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Sair</span>'
);
gb = gb.replace(
  '<span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Áudio</span>',
  '<span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Áudio</span>'
);
gb = gb.replace(
  '<span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Registro</span>',
  '<span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Registro</span>'
);
gb = gb.replace(
  '<span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Chat</span>',
  '<span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Chat</span>'
);

// Reduce Top Actions width on mobile
gb = gb.replace(
  'shrink-0 w-24 md:w-auto gap-2',
  'shrink-0 w-16 md:w-auto gap-1 md:gap-2'
);

// Make Opponent Info row-based on mobile
gb = gb.replace(
  '<div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden">',
  '<div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">'
);

// Make Player Info row-based on mobile
gb = gb.replace(
  '<div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden">',
  '<div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">'
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed mobile sidebar text');
