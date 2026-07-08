import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

bg_func = """  const getEffectBackground = (effect: string) => {
    const allCards = [
      ...(me?.board?.melee || []),
      ...(me?.board?.ranged || []),
      ...(me?.board?.scenario ? [me.board.scenario] : []),
      ...(opponent?.board?.melee || []),
      ...(opponent?.board?.ranged || []),
      ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])
    ];
    const cardWithEffect = allCards.find(c => c.effects?.includes(effect) && c.backgroundUrl);
    return cardWithEffect?.backgroundUrl;
  };

  const meleeBg = getEffectBackground('Buff de área melee') || getEffectBackground('Trap campo melee');
  const rangedBg = getEffectBackground('Buff de área ranged') || getEffectBackground('Trap campo Ranged');

"""

content = content.replace(
    "  const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;",
    bg_func + "  const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;"
)

opp_ranged = '                <div className="h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-4 gap-2 relative pl-12">'
new_opp_ranged = '                <div className="h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-4 gap-2 relative pl-12" style={rangedBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${rangedBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>'

opp_melee = '                <div className="h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-4 gap-2 relative pl-12">'
new_opp_melee = '                <div className="h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-4 gap-2 relative pl-12" style={meleeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${meleeBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>'

me_melee = '                <div className="h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-4 gap-2 relative pl-12">'
new_me_melee = '                <div className="h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-4 gap-2 relative pl-12" style={meleeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${meleeBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>'

me_ranged = '                <div className="h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-4 gap-2 relative pl-12">'
new_me_ranged = '                <div className="h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-4 gap-2 relative pl-12" style={rangedBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${rangedBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>'

# We need to replace carefully because opp_ranged and opp_melee are the same string.
# We can find their positions.

content = content.replace(opp_ranged, new_opp_ranged, 1) # Opp Ranged
content = content.replace(opp_melee, new_opp_melee, 1)   # Opp Melee

content = content.replace(me_melee, new_me_melee, 1)     # Me Melee
content = content.replace(me_ranged, new_me_ranged, 1)   # Me Ranged

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("Board bg patched")
