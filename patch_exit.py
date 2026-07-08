import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = "if(confirm('Sair da partida?')) navigate('/');"
replacement = "navigate('/');"

content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
