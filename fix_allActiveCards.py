import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Find the declaration of allActiveCards in GameBoard
decl = "const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];"

# Remove it from wherever it is (but wait, be careful to only remove the one around line 1107, not the others if there are any inside functions, though they are fine to remove if we make it accessible in the whole component, BUT the one at 116 is in `calculateScore`).
# Actually, the one at line 1107 is in the main body.
# Let's just find `const allActiveCards =` inside `export default function GameBoard()`

# Better:
content = content.replace("  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];\n", "")

# Now insert it at the top of GameBoard component, right after me and opponent:
# Look for:
# const isPlayer1 = userData?.uid === gameState?.player1?.uid;
# const me = isPlayer1 ? gameState?.player1 : gameState?.player2;
# const opponent = isPlayer1 ? gameState?.player2 : gameState?.player1;
# We can just insert it before `const allCards = [...getAllCachedCards()];` or somewhere high up.

insert_target = "  const opponent = isPlayer1 ? gameState?.player2 : gameState?.player1;"
insert_replacement = insert_target + "\n\n  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];"

content = content.replace(insert_target, insert_replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("done")
