import sys
with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """  useEffect(() => {
    if (gameState?.player1 && gameState?.player2) {"""

replacement = """  useEffect(() => {
    if (gameState?.status === 'finished') {
       if (gameState.winner === 'draw') {
          soundManager.playDraw();
       } else if (gameState.winner === userData?.uid) {
          soundManager.playVictory();
       } else {
          soundManager.playDefeat();
       }
    }
  }, [gameState?.status, gameState?.winner, userData?.uid]);

  useEffect(() => {
    if (gameState?.player1 && gameState?.player2) {"""

if "soundManager.playVictory();" not in content:
    content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
