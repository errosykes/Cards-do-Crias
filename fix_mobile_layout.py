import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Fix Center Board to have min-h-0 so it doesn't overflow its parent flex container
content = content.replace(
    '<div className="flex-1 flex flex-col relative bg-gradient-to-b from-[#141210] via-[#0f0e0c] to-[#141210]">',
    '<div className="flex-1 flex flex-col min-h-0 min-w-0 relative bg-gradient-to-b from-[#141210] via-[#0f0e0c] to-[#141210]">'
)

# Fix Battlefield area to have min-h-0 so it scrolls properly
content = content.replace(
    '<div className="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">',
    '<div className="flex-1 flex flex-col p-2 md:p-4 gap-1 overflow-y-auto min-h-0 no-scrollbar">'
)

# Hand fix: ensure cards don't shrink, layout is correct
content = content.replace(
    '<div className="h-32 sm:h-36 md:h-44 bg-[#1a1814] flex items-center justify-start md:justify-center px-4 md:px-10 gap-1 md:gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto no-scrollbar relative shrink-0">',
    '<div className="h-28 sm:h-36 md:h-44 bg-[#1a1814] flex items-center justify-start md:justify-center px-2 md:px-10 gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto no-scrollbar relative shrink-0 w-full">'
)

# Also scale down rows even more on mobile if needed so they fit
content = content.replace(
    'h-24 sm:h-28 md:h-36 bg-black/20',
    'h-20 sm:h-28 md:h-36 bg-black/20'
)
content = content.replace(
    'h-24 sm:h-28 md:h-36 bg-[#2d2922]/30',
    'h-20 sm:h-28 md:h-36 bg-[#2d2922]/30'
)

# And renderCard size on mobile
content = content.replace(
    '"relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-[#3d3326]',
    '"relative w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-[#3d3326]'
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
