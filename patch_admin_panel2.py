import sys

with open('src/pages/AdminPanel.tsx', 'r') as f:
    content = f.read()

target = """                     onClick={async () => {
                        try {
                           await updateDoc(doc(db, 'users', player.uid), {
                              hasAllCards: !player.hasAllCards
                           });
                        } catch (e) {
                           console.error(e);
                        }
                     }}"""

replacement = """                     onClick={async () => {
                        try {
                           await updateDoc(doc(db, 'users', player.uid), {
                              hasAllCards: !player.hasAllCards
                           });
                           fetchPlayers();
                        } catch (e) {
                           console.error(e);
                        }
                     }}"""

if "fetchPlayers();" not in content[content.find("hasAllCards: !player.hasAllCards"):]:
    content = content.replace(target, replacement)

with open('src/pages/AdminPanel.tsx', 'w') as f:
    f.write(content)
print("done")
