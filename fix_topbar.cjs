const fs = require('fs');
let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  '<div className="w-full md:w-64 bg-[#141210] flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-[#3d3326] shadow-2xl z-10 shrink-0">',
  '<div className="w-full md:w-64 bg-[#141210] flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-[#3d3326] shadow-2xl z-10 shrink-0 overflow-y-auto max-h-32 md:max-h-none">'
);

// Decrease margin-top of pass button
gb = gb.replace(
  '<div className="w-full mt-6 flex flex-col gap-2 relative z-10">',
  '<div className="w-full mt-2 md:mt-6 flex flex-col gap-2 relative z-10">'
);
gb = gb.replace(
  '<div className="w-full mt-6 flex flex-col gap-2 relative z-10">',
  '<div className="w-full mt-2 md:mt-6 flex flex-col gap-2 relative z-10">'
); // doing it twice in case there are multiple (one for pass, one for rematch)

// Make scores smaller on mobile
gb = gb.replace(
  '<div className="text-3xl md:text-5xl font-black md:mb-2 text-[#d4c3a1] relative z-10">{calculateScore(me!, opponent!)}</div>',
  '<div className="text-xl md:text-5xl font-black md:mb-2 text-[#d4c3a1] relative z-10">{calculateScore(me!, opponent!)}</div>'
);
gb = gb.replace(
  '<div className="text-3xl md:text-5xl font-black md:mt-2 text-[#d4c3a1] relative z-10">{calculateScore(opponent!, me!)}</div>',
  '<div className="text-xl md:text-5xl font-black md:mt-2 text-[#d4c3a1] relative z-10">{calculateScore(opponent!, me!)}</div>'
);

// Scale avatar on mobile
gb = gb.replace(
  'className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover"',
  'className="w-5 h-5 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover"'
);
gb = gb.replace(
  'className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover"',
  'className="w-5 h-5 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover"'
);

// Reduce padding on mobile info panels
gb = gb.replace(
  '<div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">',
  '<div className="p-1 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">'
);
gb = gb.replace(
  '<div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">',
  '<div className="p-1 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">'
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Fixed Top bar size');
