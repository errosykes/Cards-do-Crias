import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# In GameBoard component, we have `allActiveCards`. We should define it before it is used.
# Let's find where allMelee and allRanged are defined.
# They are defined around line 1020, let's move `allActiveCards` definition to the top of `GameBoard` render or just before we need it.
# Actually, inside the component we have:
# const globalMeleeBuffs = ...

# Let's define `allActiveCards` right after `globalRangedTraps` is calculated.
insert_idx = content.find("const globalMeleeTraps = pMeleeTraps + oMeleeTraps;")
if insert_idx != -1:
    end_of_line = content.find("\n", insert_idx)
    definition = "\n  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];\n"
    content = content[:end_of_line] + definition + content[end_of_line:]

# Now replace calls:
# getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps)
# -> add allActiveCards
content = content.replace(
    "const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);",
    "const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);"
)
content = content.replace(
    "const getPoints = (c, row, sc1, sc2) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);",
    "const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);"
)

# Replace direct calls in JSX maps
content = re.sub(
    r"getCardPoints\(c, opponent\.board\.ranged, opponent\.board\.scenario, me\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getCardPoints(c, opponent.board.ranged, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)
content = re.sub(
    r"getCardPoints\(c, opponent\.board\.melee, opponent\.board\.scenario, me\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getCardPoints(c, opponent.board.melee, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)
content = re.sub(
    r"getCardPoints\(c, me\.board\.melee, me\.board\.scenario, opponent\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getCardPoints(c, me.board.melee, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)
content = re.sub(
    r"getCardPoints\(c, me\.board\.ranged, me\.board\.scenario, opponent\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getCardPoints(c, me.board.ranged, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Updated calls")
