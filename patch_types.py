import sys
import re

with open('src/types.ts', 'r') as f:
    content = f.read()

target = "isBotMatch?: boolean;"
replacement = "isBotMatch?: boolean;\n  botDifficulty?: 'easy' | 'normal' | 'hard' | 'expert';"
if "botDifficulty?:" not in content:
    content = content.replace(target, replacement)

with open('src/types.ts', 'w') as f:
    f.write(content)

print("done")
