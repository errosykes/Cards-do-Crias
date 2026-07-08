import sys
with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'z-20 overflow-x-auto relative shrink-0',
    'z-20 overflow-x-auto no-scrollbar relative shrink-0'
)
with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
