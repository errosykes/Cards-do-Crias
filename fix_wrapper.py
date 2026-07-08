import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<div className="flex-1 flex flex-col md:flex-row overflow-hidden">',
    '<div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">'
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
