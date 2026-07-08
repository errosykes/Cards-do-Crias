import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# 1. Overlay for Targeting
overlay_html = """
      {targetingAssassinSpy && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-pulse">
          <span className="font-bold uppercase tracking-widest text-xs">Selecione uma carta inimiga para destruir</span>
          <button onClick={() => setTargetingAssassinSpy(null)} className="bg-black/50 hover:bg-black p-1 rounded-full"><X className="w-4 h-4" /></button>
        </div>
      )}
"""

content = content.replace(
    '{selectedCardModal && (',
    overlay_html + '\n      {selectedCardModal && ('
)

# 2. Modify Opponent Ranged and Melee map
# We will use a regex to replace `undefined, getCardPoints(` with `targetingAssassinSpy ? () => handleTargetEnemy(c) : undefined, getCardPoints(`

def replace_map(content, row_name, key_prefix):
    old = f"{{opponent?.board.{row_name}.map((c, idx) => renderCard(c, `{key_prefix}-${{idx}}`, undefined, getCardPoints("
    new = f"{{opponent?.board.{row_name}.map((c, idx) => renderCard(c, `{key_prefix}-${{idx}}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints("
    return content.replace(old, new)

content = replace_map(content, 'ranged', 'opp-r')
content = replace_map(content, 'melee', 'opp-m')

# 3. Add handleTargetEnemy function before return
handle_func = """
  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (
"""

content = content.replace('  return (', handle_func)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Added targeting logic to opponent cards")
