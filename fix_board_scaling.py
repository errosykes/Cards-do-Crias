import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# 1. Update renderCard signature
content = content.replace(
    "const renderCard = (card: Card, keySuffix: string | number = '', onClick?: () => void, modifiedPoints?: number) => {",
    "const renderCard = (card: Card, keySuffix: string | number = '', onClick?: () => void, modifiedPoints?: number, location: 'board' | 'hand' = 'board') => {"
)

# 2. Update renderCard size classes
# Current classes: "relative w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0"
size_classes = """${location === 'hand' ? 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0"""

content = re.sub(
    r'"relative w-14 h-20 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-\[#3d3326\] border sm:border-2 border-\[#a67c52\] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0"',
    f'`relative {size_classes}`',
    content
)

# 3. Update hand rendering to pass 'hand'
content = content.replace(
    "return renderCard(card, `hand-${idx}`, () => playCard(card, targetRow));",
    "return renderCard(card, `hand-${idx}`, () => playCard(card, targetRow), undefined, 'hand');"
)

# 4. Update Board Row Heights
# Opponent Scenario
content = content.replace(
    '<div className="h-16 sm:h-20 md:h-24 bg-black/20 border border-white/5 flex items-center px-4 gap-2 relative">',
    '<div className="min-h-[3.5rem] flex-1 sm:flex-none sm:h-20 md:h-24 bg-black/20 border border-white/5 flex items-center px-2 md:px-4 gap-1 md:gap-2 relative">'
)
# Opponent Ranged
content = content.replace(
    '<div className="h-20 sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-4 gap-2 relative pl-8 md:pl-12"',
    '<div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12"'
)
# Opponent Melee
content = content.replace(
    '<div className="h-20 sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-4 gap-2 relative pl-8 md:pl-12"',
    '<div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12"'
)

# Player Melee
content = content.replace(
    '<div className="h-20 sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-4 gap-2 relative pl-8 md:pl-12"',
    '<div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12"'
)
# Player Ranged
content = content.replace(
    '<div className="h-20 sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-4 gap-2 relative pl-8 md:pl-12"',
    '<div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12"'
)
# Player Scenario
content = content.replace(
    '<div className="h-16 sm:h-20 md:h-24 bg-[#2d2922]/30 border border-[#a67c52]/20 flex items-center px-4 gap-2 relative">',
    '<div className="min-h-[3.5rem] flex-1 sm:flex-none sm:h-20 md:h-24 bg-[#2d2922]/30 border border-[#a67c52]/20 flex items-center px-2 md:px-4 gap-1 md:gap-2 relative">'
)

# 5. Fix Hand container scrolling alignment
content = content.replace(
    '<div className="h-28 sm:h-36 md:h-44 bg-[#1a1814] flex items-center justify-start md:justify-center px-2 md:px-10 gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto no-scrollbar relative shrink-0 w-full">',
    '<div className="h-28 sm:h-36 md:h-44 bg-[#1a1814] flex items-center md:items-center justify-start md:justify-center px-4 md:px-10 gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto no-scrollbar relative shrink-0 w-full pt-4 md:pt-0">'
)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Scaled board for mobile")
