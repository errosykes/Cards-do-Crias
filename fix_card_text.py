import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'text-[9px] font-bold uppercase',
    'text-[7px] md:text-[9px] font-bold uppercase'
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
