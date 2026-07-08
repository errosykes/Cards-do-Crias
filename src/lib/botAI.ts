import { GameState, Card } from '../types';

export function calculateSimulatedScore(board: any): number {
  let score = 0;
  
  let meleeMultiplier = 1;
  let rangedMultiplier = 1;

  if (board.scenario?.effects?.includes('Frio Congelante')) {
    meleeMultiplier = 0.5;
  }
  if (board.scenario?.effects?.includes('Nevoeiro Impenetrável')) {
    rangedMultiplier = 0.5;
  }
  if (board.scenario?.effects?.includes('Chuva Torrencial')) {
    // maybe affects both? just stick to melee/ranged if that's what it did
  }

  const calcRow = (row: Card[], multiplier: number) => {
    let rowScore = 0;
    const namesCount: Record<string, number> = {};
    row.forEach(c => {
      namesCount[c.name] = (namesCount[c.name] || 0) + 1;
    });

    row.forEach(c => {
      if (c.effects?.includes('Herói')) {
        rowScore += c.points; // immune
      } else {
        let pts = c.points * multiplier;
        if (c.effects?.includes('Vínculo Estreito') && namesCount[c.name] > 1) {
          pts *= 2;
        }
        rowScore += pts;
      }
    });
    return Math.floor(rowScore);
  };

  score += calcRow(board.melee || [], meleeMultiplier);
  score += calcRow(board.ranged || [], rangedMultiplier);

  return score;
}

export function determineBotMove(gameState: GameState): { cardIndex: number | null, pass: boolean } {
  const diff = gameState.botDifficulty || 'easy';
  const botState = gameState.player2!;
  const p1State = gameState.player1!;
  
  const botScore = botState.score || 0;
  const p1Score = p1State.score || 0;
  
  if (botState.hand.length === 0) return { cardIndex: null, pass: true };
  
  // Universal rules
  if (p1State.passed && botScore > p1Score) {
    return { cardIndex: null, pass: true };
  }

  // Find spies in hand
  const spies = botState.hand.map((c, i) => ({c, i})).filter(x => x.c.effects?.includes('Espião') || x.c.effects?.includes('Espião Assassino'));
  
  // Find medics
  const medics = botState.hand.map((c, i) => ({c, i})).filter(x => x.c.effects?.includes('Médico'));
  
  // Find scorch
  const scorches = botState.hand.map((c, i) => ({c, i})).filter(x => x.c.effects?.includes('Queimar'));

  // Find decoys (if any)
  const decoys = botState.hand.map((c, i) => ({c, i})).filter(x => x.c.effects?.includes('Manequim'));

  // Helpers
  const canWinWithCard = (card: Card) => {
    // simplified check
    return (botScore + card.points > p1Score);
  };

  const evaluateCard = (card: Card) => {
    // Simple heuristic: just returns its points, but if spy, depends on round
    if (card.effects?.includes('Espião')) {
       // if early round and we want to lose this round, spy is great
       if (gameState.round === 1) return 100; // prioritize spy
       return -10;
    }
    if (card.effects?.includes('Herói')) return card.points + 5;
    if (card.effects?.includes('Médico')) {
       if (botState.graveyard && botState.graveyard.length > 0) return card.points + 10;
       return card.points - 2; // don't waste
    }
    if (card.effects?.includes('Queimar')) {
       // Should calculate if it kills enemy's highest
       return 15;
    }
    return card.points;
  };

  if (diff === 'easy') {
     return { cardIndex: Math.floor(Math.random() * botState.hand.length), pass: false };
  }

  if (diff === 'normal') {
     if (p1State.passed && p1Score - botScore > 15) {
        return { cardIndex: null, pass: true }; // give up if too far behind
     }
     
     const evaluated = botState.hand.map((c, i) => ({ i, score: evaluateCard(c) })).sort((a, b) => b.score - a.score);
     
     // pick from top 2
     const pick = Math.min(evaluated.length - 1, Math.floor(Math.random() * 2));
     return { cardIndex: evaluated[pick].i, pass: false };
  }

  // Hard & Expert logic
  if (diff === 'hard' || diff === 'expert') {
     const isExpert = diff === 'expert';
     const round = gameState.round || 1;
     const botWonRounds = botState.roundsWon || 0;
     const p1WonRounds = p1State.roundsWon || 0;

     // If p1 passed and bot is losing, but can win with 1 card
     if (p1State.passed && botScore <= p1Score) {
        // Can we win with a single card?
        const canWin = botState.hand.map((c, i) => ({ c, i })).filter(x => botScore + (x.c.effects?.includes('Espião') ? 0 : x.c.points) > p1Score);
        if (canWin.length > 0) {
           // Play the weakest card that still wins
           canWin.sort((a, b) => a.c.points - b.c.points);
           return { cardIndex: canWin[0].i, pass: false };
        } else {
           // Cannot win with 1 card. Should we play 2? Maybe just pass to save cards, unless it's match point.
           if (p1WonRounds === 1) {
             // Must play something to survive
             const evaluated = botState.hand.map((c, i) => ({ i, score: evaluateCard(c) })).sort((a, b) => b.score - a.score);
             return { cardIndex: evaluated[0].i, pass: false };
           } else {
             return { cardIndex: null, pass: true };
           }
        }
     }

     // If neither passed, manage hand advantage
     // Round 1 strategy
     if (round === 1) {
        // Play spies first
        if (spies.length > 0) return { cardIndex: spies[0].i, pass: false };
        
        // If bot is far ahead, maybe pass to bait opponent
        if (botScore - p1Score > 15 && isExpert) {
           return { cardIndex: null, pass: true };
        }

        // If bot is behind and has fewer cards, pass to conserve
        if (botScore < p1Score && botState.hand.length < p1State.hand.length && isExpert) {
           return { cardIndex: null, pass: true };
        }
     }

     // Round 2 strategy (If bot won round 1, bleed opponent. If bot lost round 1, survive)
     if (round === 2) {
        if (botWonRounds === 1) {
           // Play spies to get cards for round 3 while forcing opponent to play
           if (spies.length > 0) return { cardIndex: spies[0].i, pass: false };
           
           // If we have more cards, play weakest
           const evaluated = botState.hand.map((c, i) => ({ i, score: evaluateCard(c), c })).sort((a, b) => a.score - b.score);
           if (evaluated.length > 0 && evaluated[0].c.points <= 5 && isExpert) {
             return { cardIndex: evaluated[0].i, pass: false };
           }
        } else {
           // Must survive
           if (botScore < p1Score && p1State.passed && isExpert) {
              const evaluated = botState.hand.map((c, i) => ({ i, score: evaluateCard(c) })).sort((a, b) => b.score - a.score);
              return { cardIndex: evaluated[0].i, pass: false };
           }
        }
     }

     // Default play best value card (starting with lowest if we just want to stall)
     if (isExpert && botScore > p1Score && botState.hand.length > 0 && p1State.hand.length > 0) {
       // Stalling play: play low value card
       const nonSpies = botState.hand.map((c, i) => ({c, i})).filter(x => !x.c.effects?.includes('Espião'));
       if (nonSpies.length > 0) {
         nonSpies.sort((a, b) => a.c.points - b.c.points);
         return { cardIndex: nonSpies[0].i, pass: false };
       }
     }

     // Normal hard play: play good card
     const evaluated = botState.hand.map((c, i) => ({ i, score: evaluateCard(c) })).sort((a, b) => b.score - a.score);
     return { cardIndex: evaluated[0].i, pass: false };
  }
  
  return { cardIndex: 0, pass: false };
}
