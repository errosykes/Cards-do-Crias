import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# Opponent
target_opp = """          {/* Opponent Info */}
          <div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">
            <div className="flex items-center gap-2 mb-2">"""

replacement_opp = """          {/* Opponent Info */}
          <div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {opponent?.profile?.coverUrl && (
              <img src={opponent.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" />
            )}
            <div className="flex items-center gap-2 mb-2 relative z-10">"""

content = content.replace(target_opp, replacement_opp)

# Me
target_me = """          {/* Player Info */}
          <div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">
             {me?.passed && <div className="absolute top-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded">Passou</div>}"""

replacement_me = """          {/* Player Info */}
          <div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden">
             {me?.profile?.coverUrl && (
                <img src={me.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" />
             )}
             {me?.passed && <div className="absolute top-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded z-10">Passou</div>}"""

content = content.replace(target_me, replacement_me)

# The rest of the `me` container elements should have z-10 to be above the cover
target_me_score = """            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4"><span className="hidden md:inline">Baralho: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.deck.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.graveyard?.length || 0}</span></div>
            <div className="text-3xl md:text-5xl font-black md:mb-2 text-[#d4c3a1]">{calculateScore(me!, opponent!)}</div>
            <div className="flex items-center gap-2 mt-2">"""

replacement_me_score = """            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4 relative z-10"><span className="hidden md:inline">Baralho: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.deck.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4 relative z-10"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.graveyard?.length || 0}</span></div>
            <div className="text-3xl md:text-5xl font-black md:mb-2 text-[#d4c3a1] relative z-10">{calculateScore(me!, opponent!)}</div>
            <div className="flex items-center gap-2 mt-2 relative z-10">"""

content = content.replace(target_me_score, replacement_me_score)

target_opp_score = """            <div className="text-3xl md:text-5xl font-black md:mt-2 text-[#d4c3a1]">{calculateScore(opponent!, me!)}</div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 md:mt-4"><span className="hidden md:inline">Cartas: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.hand.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.graveyard?.length || 0}</span></div>
            {opponent?.passed && <div className="absolute bottom-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded">Passou</div>}"""

replacement_opp_score = """            <div className="text-3xl md:text-5xl font-black md:mt-2 text-[#d4c3a1] relative z-10">{calculateScore(opponent!, me!)}</div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 md:mt-4 relative z-10"><span className="hidden md:inline">Cartas: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.hand.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 relative z-10"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.graveyard?.length || 0}</span></div>
            {opponent?.passed && <div className="absolute bottom-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded z-10">Passou</div>}"""

content = content.replace(target_opp_score, replacement_opp_score)


with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
