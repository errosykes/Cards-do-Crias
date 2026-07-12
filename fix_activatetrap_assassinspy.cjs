const fs = require('fs');
let code = fs.readFileSync('src/pages/GameBoard.tsx', 'utf-8');

const anchor = `    // Apply effects
    let isScorch = card.effects?.includes('Queimar');
    let isThief = card.effects?.includes('Ladrão');
    let isDinheiroJuros = card.effects?.includes('Dinheiro a Juros');`;

const insert = `    // Apply effects
    let isScorch = card.effects?.includes('Queimar');
    let isThief = card.effects?.includes('Ladrão');
    let isDinheiroJuros = card.effects?.includes('Dinheiro a Juros');
    let isAssassinSpy = card.effects?.includes('Espião Assassino');

    if (isAssassinSpy && updatedOpponent) {
      let highestPts = -1;
      let targetCard: any = null;
      let targetRow2: any = null;
      
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

      const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);

      updatedOpponent.board.melee.forEach((c: any) => {
        const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPts) {
          highestPts = pts;
          targetCard = c;
          targetRow2 = 'melee';
        }
      });
      updatedOpponent.board.ranged.forEach((c: any) => {
        const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPts) {
          highestPts = pts;
          targetCard = c;
          targetRow2 = 'ranged';
        }
      });

      if (targetCard && targetRow2) {
        updatedOpponent.board[targetRow2] = updatedOpponent.board[targetRow2].filter((c: any) => c.id !== targetCard.id);
        updatedOpponent.graveyard.push(targetCard);
      }
    }`;

code = code.replace(anchor, insert);
fs.writeFileSync('src/pages/GameBoard.tsx', code);
console.log('Success activatetrap assassinspy');
