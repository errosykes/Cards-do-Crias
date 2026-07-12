import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """                        const top5 = history.slice(0, 5);
                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5
                        });"""

replacement = """                        const top5 = history.slice(0, 5);
                        let newProgress = uData.tournamentProgress || 1;
                        if (result === 'win' && gameState.isBotMatch) {
                           const npcNames = [
                             'O Pai de familia',
                             'Devedor de Pensão',
                             'Mordedor',
                             'Quer X-Tudo',
                             'Quer X-Bacon',
                             'O Batata'
                           ];
                           const npcIndex = npcNames.indexOf(opponent.username);
                           if (npcIndex !== -1 && npcIndex + 1 === newProgress) {
                               newProgress++;
                           }
                        }
                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5,
                            tournamentProgress: newProgress
                        });"""

if "npcNames" not in content:
    content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
