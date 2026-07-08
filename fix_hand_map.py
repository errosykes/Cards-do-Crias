import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_return = "               return renderCard(card, `hand-${idx}`, () => playCard(card, targetRow), undefined, 'hand');"
new_return = """               const onClick = () => {
                 if (card.effects?.includes('Espião Assassino')) {
                    const oppHasCards = (opponent?.board.melee.some(c => !c.effects?.includes('Herói')) || opponent?.board.ranged.some(c => !c.effects?.includes('Herói')));
                    if (oppHasCards) {
                       setTargetingAssassinSpy({ spyCard: card, targetRow: targetRow as 'melee' | 'ranged' });
                       return;
                    }
                 }
                 playCard(card, targetRow);
               };
               
               return renderCard(card, `hand-${idx}`, onClick, undefined, 'hand');"""

content = content.replace(old_return, new_return)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Hand mapping updated")
