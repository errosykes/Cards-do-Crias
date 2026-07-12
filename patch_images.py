import sys

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for t, r in replacements:
        content = content.replace(t, r)
        
    with open(filepath, 'w') as f:
        f.write(content)

# AdminPanel.tsx
patch_file('src/pages/AdminPanel.tsx', [
    ('className="w-20 h-28 object-cover rounded shadow-md border border-[#3d3326]"', 'className="w-20 h-28 object-contain rounded shadow-md border border-[#3d3326] bg-black/50"')
])

# GameBoard.tsx
patch_file('src/pages/GameBoard.tsx', [
    ('className="absolute inset-0 w-full h-full object-cover opacity-80"', 'className="absolute inset-0 w-full h-full object-contain opacity-80"')
])

# Dashboard.tsx
patch_file('src/pages/Dashboard.tsx', [
    ('className="w-full aspect-[2/3] object-cover rounded shadow-md border border-[#3d3326]"', 'className="w-full aspect-[2/3] object-contain rounded shadow-md border border-[#3d3326] bg-black/50"')
])

# CardModal.tsx
patch_file('src/components/CardModal.tsx', [
    ('className="w-full h-full object-cover"', 'className="w-full h-full object-contain"'),
    ('className="w-48 h-64 bg-[#3d3326] border-2 border-[#a67c52] rounded-md overflow-hidden relative shadow-lg"', 'className="w-full max-w-[280px] aspect-[2/3] bg-[#1a1814] border-2 border-[#a67c52] rounded-md overflow-hidden relative shadow-lg"')
])

# TradeModal.tsx
patch_file('src/components/TradeModal.tsx', [
    ('className="w-full h-full object-cover"', 'className="w-full h-full object-contain bg-black/50"')
])

# DeckModal.tsx
patch_file('src/components/DeckModal.tsx', [
    ('className="w-full aspect-[2/3] object-cover rounded shadow-md border border-[#3d3326]"', 'className="w-full aspect-[2/3] object-contain rounded shadow-md border border-[#3d3326] bg-black/50"')
])

print("done")
