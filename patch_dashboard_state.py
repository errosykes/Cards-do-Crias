import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = "const [botDifficulty, setBotDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('easy');"
replacement = "const [botDifficulty, setBotDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('easy');\n  const [showOnlyDeck, setShowOnlyDeck] = useState(false);"

if "showOnlyDeck" not in content:
    content = content.replace(target, replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
