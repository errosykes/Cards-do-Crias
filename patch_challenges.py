import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

# 1. Accept Challenge
target1 = """  const acceptChallenge = async (gameId: string) => {
    if (deckIds.length < 10) {
      alert('Você precisa de 10 cartas no baralho para jogar!');
      return;
    }"""
replacement1 = """  const acceptChallenge = async (gameId: string) => {
    if (deckIds.length !== 10) {
      alert('Você precisa de exatamente 10 cartas no baralho para jogar!');
      return;
    }"""
content = content.replace(target1, replacement1)

# 2. Add to deck
target2 = """  const handleDeckCard = async (cardId: string, action: 'add' | 'remove') => {
    let newDeck = [...deckIds];
    if (action === 'add') {
      newDeck.push(cardId);
    } else {"""
replacement2 = """  const handleDeckCard = async (cardId: string, action: 'add' | 'remove') => {
    let newDeck = [...deckIds];
    if (action === 'add') {
      if (newDeck.length >= 10) {
         alert('Seu baralho já possui o máximo de 10 cartas! Remova alguma antes de adicionar outra.');
         return;
      }
      newDeck.push(cardId);
    } else {"""
content = content.replace(target2, replacement2)

# 3. Start Bot Match
target3 = """  const startBotMatch = async () => {
    if (deckIds.length < 10) {
      alert('Você precisa de 10 cartas no baralho para jogar!');
      return;
    }"""
replacement3 = """  const startBotMatch = async () => {
    if (deckIds.length !== 10) {
      alert('Você precisa de exatamente 10 cartas no baralho para jogar!');
      return;
    }"""
content = content.replace(target3, replacement3)

# 4. Rooms
target4 = """    if (deckIds.length < 10) {
      setRoomError('Você precisa de 10 cartas no baralho para jogar!');
      return;
    }"""
replacement4 = """    if (deckIds.length !== 10) {
      setRoomError('Você precisa de exatamente 10 cartas no baralho para jogar!');
      return;
    }"""
content = content.replace(target4, replacement4).replace(target4, replacement4) # in case there are 2 (create & join)

# 5. incomingChallenge Modal
target5 = """      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}"""
replacement5 = """      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}
      {incomingChallenge && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1814] border border-[#a67c52] p-6 rounded text-center shadow-[0_0_50px_rgba(166,124,82,0.2)]">
            <h2 className="text-xl font-bold uppercase tracking-widest text-[#e2b17a] mb-4">Desafio Recebido!</h2>
            <p className="mb-6 text-[#d4c3a1]">O jogador <span className="font-bold text-white">{incomingChallenge.player1.username}</span> desafiou você para uma partida.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => declineChallenge(incomingChallenge.id!)}
                className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded font-bold uppercase text-xs transition-colors border border-red-900"
              >Recusar</button>
              <button 
                onClick={() => acceptChallenge(incomingChallenge.id!)}
                className="px-4 py-2 bg-green-900/50 hover:bg-green-800 text-green-200 rounded font-bold uppercase text-xs transition-colors border border-green-900"
              >Aceitar</button>
            </div>
          </div>
        </div>
      )}"""
if "Desafio Recebido!" not in content:
    content = content.replace(target5, replacement5)


with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
