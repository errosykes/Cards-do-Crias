import sys
import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

state_target = "const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);"
state_replacement = "const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);\n  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert'>('easy');"

if "const [botDifficulty" not in content:
    content = content.replace(state_target, state_replacement)

# Update startBotMatch
bot_match_target = "        isBotMatch: true"
bot_match_replace = "        isBotMatch: true,\n        botDifficulty: botDifficulty"

if "botDifficulty: botDifficulty" not in content:
    content = content.replace(bot_match_target, bot_match_replace)


button_target = """            <button 
              onClick={startBotMatch}
              disabled={searching}
              className="w-full mt-3 bg-[#3d3326] hover:bg-[#a67c52]/50 disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2"
            >
              Jogar contra Bot
            </button>"""

new_button = """            <div className="mt-3 flex gap-2 w-full">
              <select 
                value={botDifficulty} 
                onChange={(e) => setBotDifficulty(e.target.value as any)}
                className="bg-black/50 border border-[#3d3326] rounded px-2 py-1 text-xs text-[#e2b17a] font-bold focus:outline-none focus:border-[#a67c52] uppercase flex-1"
              >
                <option value="easy">Bot: Fácil</option>
                <option value="normal">Bot: Normal</option>
                <option value="hard">Bot: Difícil</option>
                <option value="expert">Bot: Impossível</option>
              </select>
              <button 
                onClick={startBotMatch}
                disabled={searching}
                className="flex-1 bg-[#3d3326] hover:bg-[#a67c52]/50 disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2"
              >
                Jogar Bot
              </button>
            </div>"""

if "<select \n                value={botDifficulty}" not in content:
    content = content.replace(button_target, new_button)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)

print("done")
