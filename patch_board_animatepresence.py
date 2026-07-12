import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Opponent ranged
content = content.replace(
    "{opponent?.board.ranged.map((c, idx) => renderCard(c, `opp-r-${idx}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints(c, opponent.board.ranged, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}",
    "<AnimatePresence>{opponent?.board.ranged.map((c, idx) => renderCard(c, `opp-r-${c.id}-${idx}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints(c, opponent.board.ranged, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
)

# Opponent melee
content = content.replace(
    "{opponent?.board.melee.map((c, idx) => renderCard(c, `opp-m-${idx}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints(c, opponent.board.melee, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}",
    "<AnimatePresence>{opponent?.board.melee.map((c, idx) => renderCard(c, `opp-m-${c.id}-${idx}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints(c, opponent.board.melee, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
)

# Me melee
content = content.replace(
    "{me?.board.melee.map((c, idx) => renderCard(c, `me-m-${idx}`, undefined, getCardPoints(c, me.board.melee, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}",
    "<AnimatePresence>{me?.board.melee.map((c, idx) => renderCard(c, `me-m-${c.id}-${idx}`, undefined, getCardPoints(c, me.board.melee, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
)

# Me ranged
content = content.replace(
    "{me?.board.ranged.map((c, idx) => renderCard(c, `me-r-${idx}`, undefined, getCardPoints(c, me.board.ranged, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}",
    "<AnimatePresence>{me?.board.ranged.map((c, idx) => renderCard(c, `me-r-${c.id}-${idx}`, undefined, getCardPoints(c, me.board.ranged, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>"
)

# Hand
content = content.replace(
    "{me?.hand.map((card, idx) => {",
    "<AnimatePresence>{me?.hand.map((card, idx) => {"
)

content = content.replace(
    "return renderCard(card, `hand-${idx}`, onClick, undefined, 'hand');\n             })}",
    "return renderCard(card, `hand-${card.id}-${idx}`, onClick, undefined, 'hand');\n             })}</AnimatePresence>"
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
