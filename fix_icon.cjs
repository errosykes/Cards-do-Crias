const fs = require('fs');

let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  "import { ArrowLeft, Flag, Check, UserPlus, Eye, Swords, X, MessageSquare, Volume2 } from 'lucide-react';",
  "import { ArrowLeft, Flag, Check, UserPlus, Eye, Swords, X, MessageSquare, Volume2, List } from 'lucide-react';"
);

gb = gb.replace(
  '<button onClick={() => setIsLogOpen(!isLogOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto">\n                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Registro</span>',
  '<button onClick={() => setIsLogOpen(!isLogOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">\n                 <List className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/>\n                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Registro</span>'
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed icon');
