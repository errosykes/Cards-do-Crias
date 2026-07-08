import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r"getRowScore\(opponent\?\.board\.ranged \|\| \[\], opponent\?\.board\.scenario, me\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getRowScore(opponent?.board.ranged || [], opponent?.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)
content = re.sub(
    r"getRowScore\(opponent\?\.board\.melee \|\| \[\], opponent\?\.board\.scenario, me\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getRowScore(opponent?.board.melee || [], opponent?.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)
content = re.sub(
    r"getRowScore\(me\?\.board\.melee \|\| \[\], me\?\.board\.scenario, opponent\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getRowScore(me?.board.melee || [], me?.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)
content = re.sub(
    r"getRowScore\(me\?\.board\.ranged \|\| \[\], me\?\.board\.scenario, opponent\?\.board\.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps\)",
    r"getRowScore(me?.board.ranged || [], me?.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)",
    content
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("done jsx")
