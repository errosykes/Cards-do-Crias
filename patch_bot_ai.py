import sys

with open('src/lib/botAI.ts', 'r') as f:
    content = f.read()

target_import = "import { GameState, Card } from '../types';"
replacement_import = "import { GameState, Card } from '../types';\nimport { doc, getDoc, setDoc } from 'firebase/firestore';\nimport { db } from './firebase';"

content = content.replace(target_import, replacement_import)

target_signature = "export function determineBotMove(gameState: GameState): { cardIndex: number | null, pass: boolean } {"
replacement_signature = "export async function determineBotMove(gameState: GameState): Promise<{ cardIndex: number | null, pass: boolean }> {"

content = content.replace(target_signature, replacement_signature)

# We need to insert adaptive logic at the start of the function

adaptive_logic = """
  if (diff === 'adaptive') {
     return await determineAdaptiveMove(gameState);
  }
"""
content = content.replace("  if (diff === 'easy') {", adaptive_logic + "\n  if (diff === 'easy') {")

with open('src/lib/botAI.ts', 'w') as f:
    f.write(content)
print("done")
