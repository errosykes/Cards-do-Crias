import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """                   )}
                 </select>

                 <form onSubmit={async (e) => {"""

replacement = """                   )}
                   </select>
                   {userData?.activeDeckId && userData.activeDeckId !== 'default' && (
                     <button 
                       type="button"
                       onClick={async () => {
                         if (!userData) return;
                         if (confirm('Tem certeza que deseja apagar este baralho?')) {
                           const updatedDecks = (userData.savedDecks || []).filter(d => d.id !== userData.activeDeckId);
                           const defaultDeck = updatedDecks.find(d => d.id === 'default') || { id: 'default', name: 'Baralho Padrão', cards: [] };
                           setDeckIds(defaultDeck.cards);
                           await updateDoc(doc(db, 'users', userData.uid), {
                             savedDecks: updatedDecks,
                             activeDeckId: 'default',
                             deck: defaultDeck.cards
                           });
                         }
                       }}
                       className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded font-bold uppercase text-[10px] border border-red-900 transition-colors"
                     >
                       Apagar
                     </button>
                   )}
                 </div>

                 <form onSubmit={async (e) => {"""

if "Apagar" not in content:
    content = content.replace(target, replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
