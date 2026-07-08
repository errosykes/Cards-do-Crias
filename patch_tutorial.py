import sys
import re

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

start_bot_match_def = """  const startBotMatch = async () => {"""

start_tutorial_def = """  const startTutorialMatch = async () => {
    if (deckIds.length < 10) {
      setError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }
    setSearching(true);
    
    try {
      const p1DeckPromises = deckIds.map(cid => getDoc(doc(db, 'cards', cid)));
      const p1DeckSnaps = await Promise.all(p1DeckPromises);
      const p1Deck = p1DeckSnaps.filter(s => s.exists()).map(s => ({ id: s.id, ...s.data() }));

      const cardsSnapshot = await getDocs(collection(db, 'cards'));
      const allCards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const botDeck = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 10);

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
          username: 'Mestre Tutorial',
          deck: botDeck,
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
        isTutorial: true,
        tutorialStep: 0
      };
      
      const newGameRef = await addDoc(gamesRef, newGameData);
      navigate('/game/' + newGameRef.id);
    } catch(err) {
      console.error(err);
      setError('Ocorreu um erro ao iniciar o tutorial.');
      setSearching(false);
    }
  };

  const startBotMatch = async () => {"""

content = content.replace(start_bot_match_def, start_tutorial_def)

bot_match_button = """            <button 
              onClick={startBotMatch}
              disabled={searching}
              className="w-full mt-3 bg-[#3d3326] hover:bg-[#a67c52]/50 disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2"
            >
              Jogar contra Bot
            </button>"""

tutorial_button = """            <button 
              onClick={startBotMatch}
              disabled={searching}
              className="w-full mt-3 bg-[#3d3326] hover:bg-[#a67c52]/50 disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2"
            >
              Jogar contra Bot
            </button>
            <button 
              onClick={startTutorialMatch}
              disabled={searching}
              className="w-full mt-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2 border border-blue-500/50"
            >
              Tutorial
            </button>"""

content = content.replace(bot_match_button, tutorial_button)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)

print("done")
