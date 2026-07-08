import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """            <div className="flex-none">
              <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-1">Seu Inventário</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#d4c3a1]/60 mb-6">Clique em uma carta para adicioná-la ou removê-la do seu baralho ativo.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {inventoryGrouped.length === 0 ? ("""

replacement = """            <div className="flex-none flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-1">Seu Inventário</h2>
                <p className="text-[10px] uppercase tracking-widest text-[#d4c3a1]/60">Clique em uma carta para adicioná-la ou removê-la do seu baralho ativo.</p>
              </div>
              <button 
                onClick={() => setShowOnlyDeck(!showOnlyDeck)}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded transition-colors border ${showOnlyDeck ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#e2b17a] border-[#3d3326] hover:border-[#a67c52]'}`}
              >
                {showOnlyDeck ? 'Mostrar Todas' : 'Somente no Baralho'}
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {inventoryGrouped.length === 0 ? ("""

content = content.replace(target, replacement)

target2 = """              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inventoryGrouped.map(({ card, count }) => {
                  const inDeckCount = deckCounts[card.id] || 0;
                  return ("""

replacement2 = """              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inventoryGrouped.filter(({ card }) => !showOnlyDeck || (deckCounts[card.id] || 0) > 0).map(({ card, count }) => {
                  const inDeckCount = deckCounts[card.id] || 0;
                  return ("""

content = content.replace(target2, replacement2)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
