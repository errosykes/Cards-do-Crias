import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

with open('old_logic.txt', 'r') as f:
    old_logic = f.read()

new_logic = """    await updateDoc(doc(db, 'games', gameId!), updateData);
  };

  const requestRematch = async () => {
    if (!userData?.deck || userData.deck.length < 10) {
       alert('Você precisa de pelo menos 10 cartas no baralho para jogar.');
       return;
    }
    try {
       await loadAllCards();
       const p1Deck: Card[] = userData.deck.map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
       
       if (gameState?.isBotMatch) {
         const allCards = getAllCachedCards();
         const botDeck: Card[] = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 10) as Card[];
         const newGameData: Partial<GameState> = {
            player1: {
              uid: userData.uid,
              username: userData.username,
              profile: userData.profile || null,
              deck: p1Deck,
              hand: [],
              graveyard: [],
              board: { melee: [], ranged: [], scenario: null },
              score: 0,
              passed: false,
              roundsWon: 0, initialDraw: false
            },
            player2: {
              uid: 'bot',
              username: 'Bot',
              profile: null,
              deck: botDeck,
              hand: [],
              graveyard: [],
              board: { melee: [], ranged: [], scenario: null },
              score: 0,
              passed: false,
              roundsWon: 0, initialDraw: false
            },
            status: 'playing',
            turn: userData.uid,
            round: 1,
            winner: null,
            isBotMatch: true
         };
         const newGameRef = await addDoc(collection(db, 'games'), newGameData);
         navigate('/game/' + newGameRef.id);
       } else {
         const newGameData: Partial<GameState> = {
            player1: {
              uid: userData.uid,
              username: userData.username,
              profile: userData.profile || null,
              deck: p1Deck,
              hand: [],
              graveyard: [],
              board: { melee: [], ranged: [], scenario: null },
              score: 0,
              passed: false,
              roundsWon: 0, initialDraw: false
            },
            player2: {
              uid: opponent!.uid,
              username: opponent!.username,
              profile: opponent!.profile || null,
              deck: [],
              hand: [],
              graveyard: [],
              board: { melee: [], ranged: [], scenario: null },
              score: 0,
              passed: false,
              roundsWon: 0, initialDraw: false
            },
            status: 'challenge',
            turn: userData.uid,
            round: 1,
            winner: null,
            isPrivate: true,
            roomName: `Revanche de ${userData.username}`,
            roomPassword: ''
         };
         const newGameRef = await addDoc(collection(db, 'games'), newGameData);
         
         await updateDoc(doc(db, 'games', gameId!), {
           rematchGameId: newGameRef.id,
           rematchRequestedBy: userData.uid
         });
         navigate('/game/' + newGameRef.id);
       }
    } catch (e) {
       console.error(e);
       alert('Erro ao solicitar revanche.');
    }
  };

  const acceptRematch = async () => {"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open('src/pages/GameBoard.tsx', 'w') as f:
        f.write(content)
    print("Logic patched")
else:
    # try just the requestRematch part, line endings maybe?
    # we'll regex it
    pass
