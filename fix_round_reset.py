import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_logic = """       } else {
           updateDoc(doc(db, 'games', gameId!), {
             round: (gameState.round || 1) + 1,
             'player1.board': { melee: [], ranged: [], scenario: null },
             'player2.board': { melee: [], ranged: [], scenario: null },
             'player1.score': 0,
             'player2.score': 0,
             'player1.passed': false,
             'player2.passed': false,
             'player1.roundsWon': p1Rounds,
             'player2.roundsWon': p2Rounds,
             turn: p1Score > p2Score ? gameState.player1.uid : gameState.player2.uid
           });
       }"""

new_logic = """       } else {
           const p1Graveyard = [...(gameState.player1.graveyard || [])];
           const p2Graveyard = [...(gameState.player2.graveyard || [])];

           if (gameState.player1.board) {
               if (gameState.player1.board.melee) p1Graveyard.push(...gameState.player1.board.melee);
               if (gameState.player1.board.ranged) p1Graveyard.push(...gameState.player1.board.ranged);
               if (gameState.player1.board.scenario) p1Graveyard.push(gameState.player1.board.scenario);
           }
           
           if (gameState.player2.board) {
               if (gameState.player2.board.melee) p2Graveyard.push(...gameState.player2.board.melee);
               if (gameState.player2.board.ranged) p2Graveyard.push(...gameState.player2.board.ranged);
               if (gameState.player2.board.scenario) p2Graveyard.push(gameState.player2.board.scenario);
           }

           updateDoc(doc(db, 'games', gameId!), {
             round: (gameState.round || 1) + 1,
             'player1.board': { melee: [], ranged: [], scenario: null },
             'player2.board': { melee: [], ranged: [], scenario: null },
             'player1.graveyard': p1Graveyard,
             'player2.graveyard': p2Graveyard,
             'player1.score': 0,
             'player2.score': 0,
             'player1.passed': false,
             'player2.passed': false,
             'player1.roundsWon': p1Rounds,
             'player2.roundsWon': p2Rounds,
             turn: p1Score > p2Score ? gameState.player1.uid : gameState.player2.uid
           });
       }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("Replaced!")
else:
    print("Could not find old_logic")

