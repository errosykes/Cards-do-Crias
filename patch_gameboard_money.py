import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5,
                            tournamentProgress: newProgress
                        });"""

replacement = """                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5,
                            tournamentProgress: newProgress,
                            cruzeiros: currentCruzeiros
                        });"""

if target in content:
    content = content.replace(target, replacement)
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("done 1")

target2 = """                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5
                        });"""

replacement2 = """                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5,
                            cruzeiros: currentCruzeiros
                        });"""

if target2 in content:
    content = content.replace(target2, replacement2)
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("done 2")
