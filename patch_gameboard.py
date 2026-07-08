import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Add sound manager import
import_target = "import { Card, GameState, GamePlayerState } from '../types';"
import_replacement = "import { Card, GameState, GamePlayerState } from '../types';\nimport { soundManager } from '../lib/sound';"
if "import { soundManager }" not in content:
    content = content.replace(import_target, import_replacement)

# Add playCardPlay sound
playcard_target = """  const playCard = async (card: Card, targetRow: 'melee' | 'ranged' | 'scenario' | 'discard', targetEnemyCard?: Card) => {
    if (!isMyTurn || me?.passed) return;"""
playcard_replacement = """  const playCard = async (card: Card, targetRow: 'melee' | 'ranged' | 'scenario' | 'discard', targetEnemyCard?: Card) => {
    if (!isMyTurn || me?.passed) return;
    soundManager.playCardPlay();"""
content = content.replace(playcard_target, playcard_replacement)

# Add sound effect on win/loss/draw using a new useEffect near the existing ones
useeffect_target = """  // Reset round ready states
  useEffect(() => {"""
useeffect_replacement = """  // Sound effect on game end
  useEffect(() => {
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

  // Reset round ready states
  useEffect(() => {"""
if "soundManager.playVictory();" not in content:
    content = content.replace(useeffect_target, useeffect_replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
