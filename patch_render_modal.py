import sys

with open('src/pages/Dashboard.tsx', 'r') as f:
    content = f.read()

target = """      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}"""

replacement = """      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}
      {showDeckModal && userData && (
        <DeckModal userData={userData} onClose={() => setShowDeckModal(false)} />
      )}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}"""

content = content.replace(target, replacement)

with open('src/pages/Dashboard.tsx', 'w') as f:
    f.write(content)
print("done")
