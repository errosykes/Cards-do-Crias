import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

if "import { loadAllCards, getCachedCard }" in content:
    content = content.replace("import { loadAllCards, getCachedCard }", "import { loadAllCards, getCachedCard, getAllCachedCards }")
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("Fixed import")
else:
    print("Import not found")

