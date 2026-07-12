const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `  const renderCard = (card: Card, keySuffix: string | number = '', onClick?: () => void, modifiedPoints?: number, location: 'board' | 'hand' = 'board') => {
    const pts = modifiedPoints !== undefined ? modifiedPoints : card.points;
    const isBuffed = pts > card.points;
    const isDebuffed = pts < card.points;
  

  return (`;

const insert = `  const renderCard = (card: Card, keySuffix: string | number = '', onClick?: () => void, modifiedPoints?: number, location: 'board' | 'hand' = 'board') => {
    if (card.isFacedown) {
      return (
        <motion.div 
          key={\`\${card.id}-\${keySuffix}\`}
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
          whileHover={onClick ? { y: -10, scale: 1.05 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onClick}
          className={cn(
            \`relative \${location === 'hand' ? 'w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0\`,
            onClick && "cursor-pointer hover:border-[#e2b17a] hover:shadow-[0_0_15px_rgba(226,177,122,0.5)] transition-colors duration-300"
          )}
        >
          {card.backImageUrl ? (
            <img src={card.backImageUrl} referrerPolicy="no-referrer" alt="Facedown" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#1a1814]">
              <div className="text-[#a67c52] text-xl font-bold tracking-widest opacity-30">?</div>
            </div>
          )}
        </motion.div>
      );
    }

    const pts = modifiedPoints !== undefined ? modifiedPoints : card.points;
    const isBuffed = pts > card.points;
    const isDebuffed = pts < card.points;
  

  return (`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success renderCard update');
