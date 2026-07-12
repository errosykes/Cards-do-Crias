import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Opponent graveyard
content = content.replace(
    """<span className="text-[#e2b17a] font-bold text-sm">{opponent?.graveyard?.length || 0}</span></div>""",
    """<span className="text-[#e2b17a] font-bold text-sm">{opponent?.graveyard?.length || 0}</span></div>
            {opponent?.graveyard && opponent.graveyard.length > 0 && (
               <div className="absolute top-1/2 -right-4 md:-right-8 w-12 h-16 md:w-16 md:h-24 bg-[#1a1814] border border-[#3d3326] rounded opacity-50 overflow-hidden transform -translate-y-1/2 scale-50 md:scale-75 cursor-pointer hover:opacity-100 hover:scale-75 md:hover:scale-100 transition-all z-20 shadow-lg flex items-center justify-center">
                  <AnimatePresence>
                     <motion.img 
                        key={`opp-gy-${opponent.graveyard[opponent.graveyard.length - 1].id}`}
                        src={opponent.graveyard[opponent.graveyard.length - 1].imageUrl}
                        initial={{ opacity: 0, scale: 1.5, y: -20, rotate: 10 }}
                        animate={{ opacity: 0.8, scale: 1, y: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-full object-cover"
                     />
                  </AnimatePresence>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-xl">{opponent.graveyard.length}</div>
               </div>
            )}"""
)

# Me graveyard
content = content.replace(
    """<span className="text-[#e2b17a] font-bold text-sm">{me?.graveyard?.length || 0}</span></div>""",
    """<span className="text-[#e2b17a] font-bold text-sm">{me?.graveyard?.length || 0}</span></div>
            {me?.graveyard && me.graveyard.length > 0 && (
               <div className="absolute top-1/2 -right-4 md:-right-8 w-12 h-16 md:w-16 md:h-24 bg-[#1a1814] border border-[#3d3326] rounded opacity-50 overflow-hidden transform -translate-y-1/2 scale-50 md:scale-75 cursor-pointer hover:opacity-100 hover:scale-75 md:hover:scale-100 transition-all z-20 shadow-lg flex items-center justify-center" onClick={() => setSelectedCardModal(me.graveyard[me.graveyard.length - 1])}>
                  <AnimatePresence>
                     <motion.img 
                        key={`me-gy-${me.graveyard[me.graveyard.length - 1].id}`}
                        src={me.graveyard[me.graveyard.length - 1].imageUrl}
                        initial={{ opacity: 0, scale: 1.5, y: -20, rotate: -10 }}
                        animate={{ opacity: 0.8, scale: 1, y: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-full object-cover"
                     />
                  </AnimatePresence>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-xl">{me.graveyard.length}</div>
               </div>
            )}"""
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
