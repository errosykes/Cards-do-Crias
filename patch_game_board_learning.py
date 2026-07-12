import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

import_target = "import { determineBotMove } from '../lib/botAI';"
import_replacement = "import { determineBotMove, updateAdaptiveBotLearning } from '../lib/botAI';"
content = content.replace(import_target, import_replacement)

# Inside processGameEnd
target_learning = """           updateDoc(doc(db, 'games', gameId!), {
             status: 'finished',"""
             
replacement_learning = """           if (gameState.isBotMatch && gameState.botDifficulty === 'adaptive') {
               await updateAdaptiveBotLearning(gameState, winnerId);
           }
           updateDoc(doc(db, 'games', gameId!), {
             status: 'finished',"""

content = content.replace(target_learning, replacement_learning)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
