import sys
import re

with open('src/pages/GameBoard.tsx', 'r') as f:
    content = f.read()

# 1. Add state
content = content.replace(
    'const [selectedCardModal, setSelectedCardModal] = useState<Card | null>(null);',
    'const [selectedCardModal, setSelectedCardModal] = useState<Card | null>(null);\n  const [targetingAssassinSpy, setTargetingAssassinSpy] = useState<{ spyCard: Card, targetRow: "melee" | "ranged" } | null>(null);'
)

# 2. Modify playCard signature
content = content.replace(
    "const playCard = async (card: Card, targetRow: 'melee' | 'ranged' | 'scenario' | 'discard') => {",
    "const playCard = async (card: Card, targetRow: 'melee' | 'ranged' | 'scenario' | 'discard', targetEnemyCard?: Card) => {"
)

# 3. Replace automatic assassin logic in playCard
automatic_assassin_block = """    if (isAssassinSpy && updatedOpponent) {
      const pMeleeBuffs = countGlobalBuff(newBoard, 'Buff de área melee');
      const pRangedBuffs = countGlobalBuff(newBoard, 'Buff de área ranged');
      const oMeleeBuffs = countGlobalBuff(updatedOpponent?.board, 'Buff de área melee');
      const oRangedBuffs = countGlobalBuff(updatedOpponent?.board, 'Buff de área ranged');
      
      const pMeleeTraps = countGlobalBuff(newBoard, 'Trap campo melee');
      const pRangedTraps = countGlobalBuff(newBoard, 'Trap campo Ranged');
      const oMeleeTraps = countGlobalBuff(updatedOpponent?.board, 'Trap campo melee');
      const oRangedTraps = countGlobalBuff(updatedOpponent?.board, 'Trap campo Ranged');
      
      const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
      const globalRangedBuffs = pRangedBuffs + oRangedBuffs;
      const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
      const globalRangedTraps = pRangedTraps + oRangedTraps;

      const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps);
      let highestPoints = -1;
      
      updatedOpponent.board.melee.forEach(c => {
        if (c.id === card.id) return; // don't kill the spy itself if it just landed
        const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      updatedOpponent.board.ranged.forEach(c => {
        if (c.id === card.id) return;
        const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });

      if (highestPoints > -1) {
        let destroyed = false;
        updatedOpponent.board.melee = updatedOpponent.board.melee.filter(c => {
          if (destroyed) return true;
          if (c.id === card.id) return true;
          const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            updatedOpponent.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
        updatedOpponent.board.ranged = updatedOpponent.board.ranged.filter(c => {
          if (destroyed) return true;
          if (c.id === card.id) return true;
          const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            updatedOpponent.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
      }
    }"""

manual_assassin_block = """    if (isAssassinSpy && updatedOpponent && targetEnemyCard) {
      let destroyed = false;
      updatedOpponent.board.melee = updatedOpponent.board.melee.filter(c => {
        if (!destroyed && c.id === targetEnemyCard.id && !c.effects?.includes('Herói')) {
          updatedOpponent.graveyard.push(c);
          destroyed = true;
          return false;
        }
        return true;
      });
      if (!destroyed) {
        updatedOpponent.board.ranged = updatedOpponent.board.ranged.filter(c => {
          if (!destroyed && c.id === targetEnemyCard.id && !c.effects?.includes('Herói')) {
            updatedOpponent.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
      }
    }"""

# Note: this logic replaces the SECOND occurrence, because the first one is inside doBotTurn and uses `cardToPlay`. But wait, in playCard it uses `card`.
# Let's just do replace, it should only match the one in playCard because of `c.id === card.id` vs `c.id === cardToPlay.id`.
content = content.replace(automatic_assassin_block, manual_assassin_block)

# 4. Modify hand mapping to intercept playCard for Espião Assassino
hand_map_old = """             {me?.hand.map((card, idx) => {
               let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
               if (card.type === 'Ranged') targetRow = 'ranged';
               if (card.type === 'Cenário' || card.type === 'Scenario' || card.effects?.includes('Clima')) targetRow = 'scenario';
               if (card.type === 'Magic' || card.type === 'Heal' || card.type === 'Event') {
                 if (!card.effects?.includes('Clima')) targetRow = 'discard';
               }
               return renderCard(card, `hand-${idx}`, () => playCard(card, targetRow), undefined, 'hand');
             })}"""

hand_map_new = """             {me?.hand.map((card, idx) => {
               let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
               if (card.type === 'Ranged') targetRow = 'ranged';
               if (card.type === 'Cenário' || card.type === 'Scenario' || card.effects?.includes('Clima')) targetRow = 'scenario';
               if (card.type === 'Magic' || card.type === 'Heal' || card.type === 'Event') {
                 if (!card.effects?.includes('Clima')) targetRow = 'discard';
               }
               
               const onClick = () => {
                 if (card.effects?.includes('Espião Assassino')) {
                    const oppHasCards = (opponent?.board.melee.length || 0) > 0 || (opponent?.board.ranged.length || 0) > 0;
                    if (oppHasCards) {
                       setTargetingAssassinSpy({ spyCard: card, targetRow: targetRow as 'melee' | 'ranged' });
                       return;
                    }
                 }
                 playCard(card, targetRow);
               };
               
               return renderCard(card, `hand-${idx}`, onClick, undefined, 'hand');
             })}"""

content = content.replace(hand_map_old, hand_map_new)

with open('src/pages/GameBoard.tsx', 'w') as f:
    f.write(content)

print("Updated playCard and hand rendering")
