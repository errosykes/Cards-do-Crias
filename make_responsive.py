import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# 1. Main Wrapper
content = content.replace(
    '<div className="flex-1 flex overflow-hidden">',
    '<div className="flex-1 flex flex-col md:flex-row overflow-hidden">'
)

# 2. Sidebar
content = content.replace(
    '<div className="w-64 bg-[#141210] flex flex-col border-r border-[#3d3326] shadow-2xl z-10">',
    '<div className="w-full md:w-64 bg-[#141210] flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-[#3d3326] shadow-2xl z-10 shrink-0">'
)
# Top Actions
content = content.replace(
    '<div className="p-4 border-b border-[#3d3326] flex items-center justify-between">',
    '<div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col md:flex-row items-center justify-center md:justify-between shrink-0 w-20 md:w-auto">'
)
# Opponent Info
content = content.replace(
    '<div className="p-6 border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">',
    '<div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">'
)
# Player Info
content = content.replace(
    '<div className="p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">',
    '<div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">'
)

# 3. Sidebar inner elements scaling
content = content.replace(
    '<div className="text-5xl font-black mt-2 text-[#d4c3a1]">',
    '<div className="text-3xl md:text-5xl font-black md:mt-2 text-[#d4c3a1]">'
)
content = content.replace(
    '<div className="text-5xl font-black mb-2 text-[#d4c3a1]">',
    '<div className="text-3xl md:text-5xl font-black md:mb-2 text-[#d4c3a1]">'
)
content = content.replace(
    'className="w-10 h-10 rounded-full',
    'className="w-6 h-6 md:w-10 md:h-10 rounded-full'
)
# Hide some labels on mobile
content = content.replace(
    'Cartas: <span',
    '<span className="hidden md:inline">Cartas: </span><span'
)
content = content.replace(
    'Cemitério: <span',
    '<span className="hidden md:inline">Cemitério: </span><span'
)
content = content.replace(
    'Baralho: <span',
    '<span className="hidden md:inline">Baralho: </span><span'
)
content = content.replace(
    '<div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-4">',
    '<div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 md:mt-4">'
)
content = content.replace(
    '<div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-4">',
    '<div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4">'
)

# 4. Render Card
# "relative w-24 h-32 bg-[#3d3326] border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col"
content = content.replace(
    '"relative w-24 h-32 bg-[#3d3326] border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col"',
    '"relative w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32 bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0"'
)
content = content.replace(
    'w-6 h-6 rounded-full flex items-center justify-center text-[10px]',
    'w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px]'
)

# 5. Rows
content = content.replace(
    'h-36 bg-black/20',
    'h-24 sm:h-28 md:h-36 bg-black/20'
)
content = content.replace(
    'h-36 bg-[#2d2922]/30',
    'h-24 sm:h-28 md:h-36 bg-[#2d2922]/30'
)
content = content.replace(
    'h-24 bg-black/20',
    'h-16 sm:h-20 md:h-24 bg-black/20'
)
content = content.replace(
    'h-24 bg-[#2d2922]/30',
    'h-16 sm:h-20 md:h-24 bg-[#2d2922]/30'
)
content = content.replace(
    'pl-12',
    'pl-8 md:pl-12'
)
content = content.replace(
    'w-8 h-8',
    'w-6 h-6 md:w-8 md:h-8'
)
content = content.replace(
    'left-[-10px]',
    'left-0 md:left-[-10px]'
)

# 6. Hand
content = content.replace(
    '<div className="h-44 bg-[#1a1814] flex items-center justify-center px-10 gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">',
    '<div className="h-32 sm:h-36 md:h-44 bg-[#1a1814] flex items-center justify-start md:justify-center px-4 md:px-10 gap-1 md:gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto relative shrink-0">'
)
content = content.replace(
    'bottom-44 mb-2',
    'bottom-full mb-1 md:mb-2'
)

# Add custom scrollbar styling to index.css for webkit scrollbar if not already there, 
# or we just rely on standard scrollbar.

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("GameBoard responsive patch applied.")
