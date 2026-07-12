import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

# Add import
if 'TournamentTab' not in content:
    content = content.replace("import { CardModal } from '../components/CardModal';", "import { CardModal } from '../components/CardModal';\nimport { TournamentTab } from '../components/TournamentTab';")

# Add startSpecificBotMatch function
func_to_add = """
  const startSpecificBotMatch = async (diff: string, customDeck: Card[], botName: string) => {
    if (deckIds.length < 10) {
      setError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }
    setSearching(true);
    
    try {
      const p1DeckPromises = deckIds.map(cid => getDoc(doc(db, 'cards', cid)));
      const p1DeckSnaps = await Promise.all(p1DeckPromises);
      const p1Deck: Card[] = p1DeckSnaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() } as Card));

      const gamesRef = collection(db, 'games');
      const newGameData = {
        player1: {
          uid: userData?.uid,
          username: userData?.username,
          profile: userData?.profile || null,
          deck: p1Deck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        player2: {
          uid: 'bot',
          username: botName,
          deck: customDeck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        status: 'playing',
        turn: userData?.uid,
        round: 1,
        winner: null,
        isBotMatch: true,        
        botDifficulty: diff
      };
      
      const newGameRef = await addDoc(gamesRef, newGameData);
      navigate('/game/' + newGameRef.id);
    } catch(err) {
      console.error(err);
      setError('Ocorreu um erro ao iniciar a partida com o bot.');
      setSearching(false);
    }
  };
"""

if 'startSpecificBotMatch' not in content:
    content = content.replace("const findMatch = async () => {", func_to_add + "\n  const findMatch = async () => {")

# Add mainTab state
if 'const [mainTab, setMainTab]' not in content:
    content = content.replace("const [roomMode, setRoomMode] = useState<'create' | 'join'>('create');", "const [roomMode, setRoomMode] = useState<'create' | 'join'>('create');\n  const [mainTab, setMainTab] = useState<'geral' | 'torneio'>('geral');")

# Add mainTab selector and logic
header_target = """        <div className="flex gap-4">
          {userData?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-2 bg-[#a67c52]/10 border border-[#a67c52]/30 text-[#a67c52] px-4 py-2 rounded text-xs font-bold uppercase hover:bg-[#a67c52]/20 transition-colors">
              <ShieldAlert className="w-4 h-4" /> Painel Admin
            </Link>
          )}"""

header_replacement = """        <div className="w-full mt-4 flex gap-2 justify-center lg:justify-start">
           <button 
              onClick={() => setMainTab('geral')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'geral' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              Geral
           </button>
           <button 
              onClick={() => setMainTab('torneio')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'torneio' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              1º Torneio
           </button>
        </div>
      </div>
      
      {mainTab === 'torneio' && userData && (
         <TournamentTab userData={userData} startSpecificBotMatch={startSpecificBotMatch} searching={searching} />
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${mainTab === 'geral' ? '' : 'hidden'}`}>"""

if "mainTab === 'geral' ? '' : 'hidden'" not in content:
    # Need to replace the start of grid
    content = content.replace('<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">', header_replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
