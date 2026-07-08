import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

bg_func = """  const getEffectBackground = (effect: string) => {
    const allCards = [
      ...(me?.board?.melee || []),
      ...(me?.board?.ranged || []),
      ...(me?.board?.scenario ? [me.board.scenario] : []),
      ...(opponent?.board?.melee || []),
      ...(opponent?.board?.ranged || []),
      ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])
    ];
    const cardWithEffect = allCards.find(c => c.effects?.includes(effect) && c.backgroundUrl);
    return cardWithEffect?.backgroundUrl;
  };

  const meleeBg = getEffectBackground('Buff de área melee') || getEffectBackground('Trap campo melee');
  const rangedBg = getEffectBackground('Buff de área ranged') || getEffectBackground('Trap campo Ranged');

"""

content = content.replace(bg_func, "")

# Now add it back exactly once, just before the last occurrence of globalMeleeBuffs
# Wait, I also need to restore `const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;` at the places where it was completely replaced!
# Actually, the string I replaced WAS replaced with `bg_func + "  const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;"`
# So `content = content.replace(bg_func, "")` will revert all 4 occurrences!

content = content.replace(bg_func, "")

# Now inject bg_func correctly inside GameBoard component
# Let's find:
#   const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
#   const globalRangedBuffs = pRangedBuffs + oRangedBuffs;
# We want to replace the LAST occurrence of it.

parts = content.split("const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;")
# There should be 5 parts now (4 occurrences).
if len(parts) >= 2:
    parts[-2] = parts[-2] + bg_func
    content = "const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;".join(parts)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("Fix applied")
