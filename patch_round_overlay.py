import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = "  const [isChatOpen, setIsChatOpen] = useState(false);"
replacement = """  const [isChatOpen, setIsChatOpen] = useState(false);
  const [roundOverlay, setRoundOverlay] = useState<{show: boolean, message: string, color: string}>({ show: false, message: '', color: '' });
  
  // Watch for round changes
  useEffect(() => {
     if (!gameState?.round) return;
     if (gameState.status !== 'playing') return;
     
     let msg = `RODADA ${gameState.round}`;
     let color = 'text-[#e2b17a]';
     
     if (gameState.round > 1) {
         const p1Rounds = gameState.player1.roundsWon || 0;
         const p2Rounds = gameState.player2.roundsWon || 0;
         const myRounds = gameState.player1.uid === userData?.uid ? p1Rounds : p2Rounds;
         const oppRounds = gameState.player1.uid === userData?.uid ? p2Rounds : p1Rounds;
         
         if (myRounds > 0 && oppRounds === 0) {
            msg = `RODADA VENCIDA`;
            color = 'text-green-500';
         } else if (oppRounds > 0 && myRounds === 0) {
            msg = `RODADA PERDIDA`;
            color = 'text-red-500';
         } else if (myRounds === 1 && oppRounds === 1 && gameState.round === 3) {
            msg = `RODADA FINAL`;
            color = 'text-[#e2b17a]';
         }
     }
     
     setRoundOverlay({ show: true, message: msg, color });
     const t = setTimeout(() => {
        setRoundOverlay({ show: false, message: '', color: '' });
     }, 3000);
     return () => clearTimeout(t);
  }, [gameState?.round, gameState?.status, gameState?.player1.roundsWon, gameState?.player2.roundsWon]);"""

if target in content:
    content = content.replace(target, replacement)
    
    target_render = """      {targetingAssassinSpy && ("""
    replacement_render = """      <AnimatePresence>
        {roundOverlay.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
             <h1 className={`text-5xl md:text-8xl font-black uppercase tracking-[0.2em] ${roundOverlay.color} drop-shadow-[0_0_30px_rgba(0,0,0,1)] text-center`}>
                {roundOverlay.message}
             </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {targetingAssassinSpy && ("""
      
    content = content.replace(target_render, replacement_render)

    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("done")
else:
    print("Target not found")
