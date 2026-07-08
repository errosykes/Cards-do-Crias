import sys
with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """  useEffect(() => {
    if (!gameId) return;"""

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
    if (!gameId) return;"""

if "soundManager.playVictory();" not in content:
    content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
