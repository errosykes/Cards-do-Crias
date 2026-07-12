const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(
  '<div className="h-full min-h-screen bg-[#0f0e0c] text-[#d4c3a1] font-serif selection:bg-[#a67c52]/30 flex flex-col flex-1 overflow-auto">',
  '<div className="h-screen h-[100dvh] bg-[#0f0e0c] text-[#d4c3a1] font-serif selection:bg-[#a67c52]/30 flex flex-col flex-1 overflow-hidden">'
);

fs.writeFileSync('src/App.tsx', app);
console.log('Fixed App container height');
