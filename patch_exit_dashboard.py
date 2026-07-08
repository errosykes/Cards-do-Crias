import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """                         if (confirm('Tem certeza que deseja apagar este baralho?')) {
                           const updatedDecks = (userData.savedDecks || []).filter(d => d.id !== userData.activeDeckId);
                           const defaultDeck = updatedDecks.find(d => d.id === 'default') || { id: 'default', name: 'Baralho Padrão', cards: [] };
                           setDeckIds(defaultDeck.cards);
                           await updateDoc(doc(db, 'users', userData.uid), {
                             savedDecks: updatedDecks,
                             activeDeckId: 'default',
                             deck: defaultDeck.cards
                           });
                         }"""
replacement = """                           const updatedDecks = (userData.savedDecks || []).filter(d => d.id !== userData.activeDeckId);
                           const defaultDeck = updatedDecks.find(d => d.id === 'default') || { id: 'default', name: 'Baralho Padrão', cards: [] };
                           setDeckIds(defaultDeck.cards);
                           await updateDoc(doc(db, 'users', userData.uid), {
                             savedDecks: updatedDecks,
                             activeDeckId: 'default',
                             deck: defaultDeck.cards
                           });"""

content = content.replace(target, replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
