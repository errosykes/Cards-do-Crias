import sys

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

old_click = """               const onClick = () => {
                 if (card.effects?.includes('Espião Assassino')) {
                    const oppHasCards = (opponent?.board.melee.some(c => !c.effects?.includes('Herói')) || opponent?.board.ranged.some(c => !c.effects?.includes('Herói')));
                    if (oppHasCards) {
                       setTargetingAssassinSpy({ spyCard: card, targetRow: targetRow as 'melee' | 'ranged' });
                       return;
                    }
                 }
                 playCard(card, targetRow);
               };"""

new_click = """               const onClick = () => {
                 if (card.effects?.includes('Espião Assassino')) {
                    const oppHasCards = (opponent?.board.melee.some(c => !c.effects?.includes('Herói')) || opponent?.board.ranged.some(c => !c.effects?.includes('Herói')));
                    if (oppHasCards) {
                       setTargetingAssassinSpy({ spyCard: card, targetRow: targetRow as 'melee' | 'ranged' });
                       return;
                    }
                 }
                 setTargetingAssassinSpy(null);
                 playCard(card, targetRow);
               };"""

content = content.replace(old_click, new_click)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Fixed target clearing")
