import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

target = """      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}
    </div>"""

replacement = """      {isChatOpen && userData && (
        <ChatPanel 
          gameId={gameId!} 
          myUid={userData.uid} 
          myName={userData.username} 
          messages={gameState.chatMessages || []} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}
    </div>"""

if "ChatPanel" not in content[len(content)-1000:]:
    content = content.replace(target, replacement)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)
print("done")
