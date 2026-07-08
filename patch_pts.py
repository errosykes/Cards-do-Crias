import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '  return pts;',
    '  return Math.max(0, pts);'
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Updated getCardPoints to cap at 0")
