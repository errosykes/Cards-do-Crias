import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = "                        const top5 = history.slice(0, 5);"
replacement = """                        const top5 = history.slice(0, 5);
                        
                        // Add cruzeiros
                        let currentCruzeiros = uData.cruzeiros || 0;
                        let reward = 0;
                        if (result === 'win') reward = 50;
                        else if (result === 'draw') reward = 20;
                        else reward = 10;
                        currentCruzeiros += reward;"""

content = content.replace(target, replacement)

target2 = "                           await updateDoc(doc(db, 'users', myId), { matchHistory: top5, tournamentProgress: newProgress });"
replacement2 = "                           await updateDoc(doc(db, 'users', myId), { matchHistory: top5, tournamentProgress: newProgress, cruzeiros: currentCruzeiros });"
content = content.replace(target2, replacement2)

target3 = "                           await updateDoc(doc(db, 'users', myId), { matchHistory: top5 });"
replacement3 = "                           await updateDoc(doc(db, 'users', myId), { matchHistory: top5, cruzeiros: currentCruzeiros });"
content = content.replace(target3, replacement3)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
