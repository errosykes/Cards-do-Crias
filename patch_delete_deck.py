import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """                 <select 
                   value={userData?.activeDeckId || 'default'} 
                   onChange={async (e) => {
                      const id = e.target.value;
                      const deck = (userData?.savedDecks || []).find(d => d.id === id);
                      if (deck) {
                         setDeckIds(deck.cards);
                         await updateDoc(doc(db, 'users', userData!.uid), { 
                           activeDeckId: id,
                           deck: deck.cards 
                         });
                      }
                   }}
                   className="w-full bg-black/50 border border-[#3d3326] rounded px-3 py-1.5 text-sm text-[#e2b17a] font-bold focus:outline-none focus:border-[#a67c52] uppercase tracking-widest text-[10px]"
                 >"""

replacement = """                 <div className="flex gap-2">
                   <select 
                     value={userData?.activeDeckId || 'default'} 
                     onChange={async (e) => {
                        const id = e.target.value;
                        const deck = (userData?.savedDecks || []).find(d => d.id === id);
                        if (deck) {
                           setDeckIds(deck.cards);
                           await updateDoc(doc(db, 'users', userData!.uid), { 
                             activeDeckId: id,
                             deck: deck.cards 
                           });
                        }
                     }}
                     className="flex-1 bg-black/50 border border-[#3d3326] rounded px-3 py-1.5 text-sm text-[#e2b17a] font-bold focus:outline-none focus:border-[#a67c52] uppercase tracking-widest text-[10px]"
                   >"""

content = content.replace(target, replacement)

target2 = """                   )}
                 </select>
                 <form onSubmit={async (e) => {"""

replacement2 = """                   )}
                   </select>
                   {userData?.activeDeckId && userData.activeDeckId !== 'default' && (
                     <button 
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
    content = content.replace(target2, replacement2)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
