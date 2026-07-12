const fs = require('fs');

let gb = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

gb = gb.replace(
  "import { AudioSettingsModal } from '../components/AudioSettingsModal';",
  "import { AudioSettingsModal } from '../components/AudioSettingsModal';\nimport { BattleLogPanel } from '../components/BattleLogPanel';"
);

gb = gb.replace(
  "const [isChatOpen, setIsChatOpen] = useState(false);",
  "const [isChatOpen, setIsChatOpen] = useState(false);\n  const [isLogOpen, setIsLogOpen] = useState(false);"
);

gb = gb.replace(
  '<button onClick={() => setIsChatOpen(!isChatOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">',
  `<button onClick={() => setIsLogOpen(!isLogOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto">
                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Registro</span>
              </button>
              <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">`
);

gb = gb.replace(
  "{isChatOpen && userData && (\n        <ChatPanel \n          gameId={gameId!} \n          myUid={userData.uid} \n          myName={userData.username} \n          messages={gameState.chatMessages || []} \n          onClose={() => setIsChatOpen(false)} \n        />\n      )}",
  "{isChatOpen && userData && (\n        <ChatPanel \n          gameId={gameId!} \n          myUid={userData.uid} \n          myName={userData.username} \n          messages={gameState.chatMessages || []} \n          onClose={() => setIsChatOpen(false)} \n        />\n      )}\n      {isLogOpen && (\n        <BattleLogPanel \n          logs={gameState.battleLog || []} \n          onClose={() => setIsLogOpen(false)} \n        />\n      )}"
);

gb = gb.replace(
  "const updateData: any = {};\n    \n        const isTrap = playedCard.type === 'Trap';",
  "const updateData: any = {};\n    const logMsg = playedCard.type === 'Trap' ? `${me.username} jogou uma carta Trap virada para baixo.` : `${me.username} jogou a carta ${card.name}.`;\n    updateData.battleLog = arrayUnion(logMsg);\n\n        const isTrap = playedCard.type === 'Trap';"
);

gb = gb.replace(
  "const updateData: any = {\n      [`${playerKey}.passed`]: true,\n      turn: nextTurn\n    };",
  "const updateData: any = {\n      [`${playerKey}.passed`]: true,\n      turn: nextTurn,\n      battleLog: arrayUnion(`${me.username} passou o turno.`)\n    };"
);

gb = gb.replace(
  "           updateData['player2.passed'] = true;\n           const nextTurn = gameState.player1.passed ? 'bot' : gameState.player1.uid;",
  "           updateData['player2.passed'] = true;\n           updateData.battleLog = arrayUnion(`${gameState.player2.username} passou o turno.`);\n           const nextTurn = gameState.player1.passed ? 'bot' : gameState.player1.uid;"
);

gb = gb.replace(
  "        await updateDoc(doc(db, 'games', gameId!), updateData);\n      };\n      \n      doBotTurn();",
  "        updateData.battleLog = arrayUnion(cardToPlay.type === 'Trap' ? `${botState.username} jogou uma carta Trap virada para baixo.` : `${botState.username} jogou a carta ${cardToPlay.name}.`);\n        await updateDoc(doc(db, 'games', gameId!), updateData);\n      };\n      \n      doBotTurn();"
);

gb = gb.replace(
  "updateDoc(doc(db, 'games', gameId!), {\n             round: (gameState.round || 1) + 1,",
  "let roundMsg = `Fim do Round ${gameState.round || 1}. `;\n           if (p1Rounds > (gameState.player1.roundsWon||0) && p2Rounds > (gameState.player2.roundsWon||0)) roundMsg += 'Empate!';\n           else if (p1Rounds > (gameState.player1.roundsWon||0)) roundMsg += `${gameState.player1.username} venceu a rodada.`;\n           else roundMsg += `${gameState.player2.username} venceu a rodada.`;\n           updateDoc(doc(db, 'games', gameId!), {\n             battleLog: arrayUnion(roundMsg),\n             round: (gameState.round || 1) + 1,"
);

fs.writeFileSync('src/pages/GameBoard.tsx', gb);
console.log('Done refactoring');
