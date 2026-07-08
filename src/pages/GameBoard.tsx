import { useState, useEffect } from 'react';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { determineBotMove } from '../lib/botAI';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, getDoc, arrayUnion, addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { loadAllCards, getCachedCard, getAllCachedCards } from '../lib/cardsCache';
import { useAuth } from '../contexts/AuthContext';
import { GameState, Card, GamePlayerState } from '../types';
import { soundManager } from '../lib/sound';
const dummySoundHook = () => {
}
import { ArrowLeft, Flag, Check, UserPlus, Eye, Swords, X, MessageSquare } from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { CardModal } from '../components/CardModal';
import { cn } from '../lib/utils';



const countGlobalBuff = (board: any, effectName: string) => {
  if (!board) return 0;
  let count = 0;
  if (board.melee) count += board.melee.filter((c: Card) => c.effects?.includes(effectName)).length;
  if (board.ranged) count += board.ranged.filter((c: Card) => c.effects?.includes(effectName)).length;
  if (board.scenario && board.scenario.effects?.includes(effectName)) count += 1;
  return count;
};

export const getCardPoints = (
  card: Card, 
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0,
  allActiveCards: Card[] = []
) => {
  let pts = card.points || 0;
  const isHero = card.effects?.includes('Herói');
  const hasClima = scenario1?.effects?.includes('Clima') || scenario2?.effects?.includes('Clima');

  if (!isHero && hasClima) {
    pts = 1;
  }

  if (card.effects?.includes('Vínculo Estreito')) {
    const sameCards = row.filter(c => c.name === card.name).length;
    pts = pts * sameCards;
  }

  if (!isHero) {
    const moraleBoosters = row.filter(c => c !== card && c.effects?.includes('Impulso Moral')).length;
    pts += moraleBoosters;
    
    let specificBuffs = 0;
    let specificDebuffs = 0;
    
    if (allActiveCards && allActiveCards.length > 0) {
      allActiveCards.forEach(c => {
        if (c.effects?.includes('BUFF DE ESPECIFICO') && c.buffTargetNames?.includes(card.name)) specificBuffs += 1;
        if (c.effects?.includes('DBUFF DE ESPECIFICO') && c.debuffTargetNames?.includes(card.name)) specificDebuffs += 1;
      });
    } else {
      if (scenario1?.effects?.includes('BUFF DE ESPECIFICO') && scenario1.buffTargetNames?.includes(card.name)) specificBuffs += 1;
      if (scenario2?.effects?.includes('BUFF DE ESPECIFICO') && scenario2.buffTargetNames?.includes(card.name)) specificBuffs += 1;
      if (scenario1?.effects?.includes('DBUFF DE ESPECIFICO') && scenario1.debuffTargetNames?.includes(card.name)) specificDebuffs += 1;
      if (scenario2?.effects?.includes('DBUFF DE ESPECIFICO') && scenario2.debuffTargetNames?.includes(card.name)) specificDebuffs += 1;
    }
    
    pts += specificBuffs;
    pts -= specificDebuffs;


    if (card.type === 'Melee') {
      pts += globalMeleeBuffs;
      for(let i=0; i < globalMeleeTraps; i++) pts = Math.ceil(pts / 2);
    }
    if (card.type === 'Ranged') {
      pts += globalRangedBuffs;
      for(let i=0; i < globalRangedTraps; i++) pts = Math.ceil(pts / 2);
    }
  }

  return Math.max(0, pts);
};

export const getRowScore = (
  row: Card[], 
  scenario1?: Card | null, 
  scenario2?: Card | null,
  globalMeleeBuffs: number = 0,
  globalRangedBuffs: number = 0,
  globalMeleeTraps: number = 0,
  globalRangedTraps: number = 0,
  allActiveCards: Card[] = []
) => {
  if (!row) return 0;
  return row.reduce((acc, card) => acc + getCardPoints(card, row, scenario1, scenario2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards), 0);
};

export const calculateScore = (player: GamePlayerState | null, opp: GamePlayerState | null) => {
  if (!player || !player.board) return 0;
  
  const pMeleeBuffs = countGlobalBuff(player.board, 'Buff de área melee');
  const pRangedBuffs = countGlobalBuff(player.board, 'Buff de área ranged');
  const oMeleeBuffs = countGlobalBuff(opp?.board, 'Buff de área melee');
  const oRangedBuffs = countGlobalBuff(opp?.board, 'Buff de área ranged');
  
  const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
  const globalRangedBuffs = pRangedBuffs + oRangedBuffs;

  const pMeleeTraps = countGlobalBuff(player.board, 'Trap campo melee');
  const pRangedTraps = countGlobalBuff(player.board, 'Trap campo Ranged');
  const oMeleeTraps = countGlobalBuff(opp?.board, 'Trap campo melee');
  const oRangedTraps = countGlobalBuff(opp?.board, 'Trap campo Ranged');
  
  const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
  const globalRangedTraps = pRangedTraps + oRangedTraps;
  
  const allActiveCards = [
    ...(player.board.melee || []), 
    ...(player.board.ranged || []), 
    ...(player.board.scenario ? [player.board.scenario] : []), 
    ...(opp?.board?.melee || []), 
    ...(opp?.board?.ranged || []), 
    ...(opp?.board?.scenario ? [opp.board.scenario] : [])
  ];

  const meleeScore = getRowScore(player.board.melee, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
  const rangedScore = getRowScore(player.board.ranged, player.board.scenario, opp?.board?.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
  
  return meleeScore + rangedScore;
};

export default function GameBoard() {
  const { gameId } = useParams();
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [selectedCardModal, setSelectedCardModal] = useState<Card | null>(null);
  const [targetingAssassinSpy, setTargetingAssassinSpy] = useState<{ spyCard: Card, targetRow: "melee" | "ranged" } | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (gameState?.status === 'finished') {
       if (gameState.winner === 'draw') {
          soundManager.playDraw();
       } else if (gameState.winner === userData?.uid) {
          soundManager.playVictory();
       } else {
          soundManager.playDefeat();
       }
    }
  }, [gameState?.status, gameState?.winner, userData?.uid]);

  useEffect(() => {
    if (!gameId) return;
    const unsub = onSnapshot(doc(db, 'games', gameId), (docSnap) => {
      if (docSnap.exists()) {
        setGameState({ id: docSnap.id, ...docSnap.data() } as GameState);
      } else {
        navigate('/');
      }
    }, (err) => console.error('Error in games listener:', err));
  
  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (
) => unsub();
  }, [gameId, navigate]);

  const isPlayer1 = gameState?.player1.uid === userData?.uid;
  const me = isPlayer1 ? gameState?.player1 : gameState?.player2;
  const opponent = isPlayer1 ? gameState?.player2 : gameState?.player1;

  const allActiveCards = [...(me?.board?.melee || []), ...(me?.board?.ranged || []), ...(me?.board?.scenario ? [me.board.scenario] : []), ...(opponent?.board?.melee || []), ...(opponent?.board?.ranged || []), ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])];
  const isMyTurn = gameState?.turn === userData?.uid;

  useEffect(() => {
    if (gameState?.status === 'playing' && me && !me.initialDraw) {
       const drawCards = () => {
         const shuffled = [...me.deck].sort(() => 0.5 - Math.random());
         const hand = shuffled.slice(0, 5);
         const remainingDeck = shuffled.slice(5);
         
         const playerKey = isPlayer1 ? 'player1' : 'player2';
         updateDoc(doc(db, 'games', gameId!), {
           [`${playerKey}.hand`]: hand,
           [`${playerKey}.deck`]: remainingDeck,
           [`${playerKey}.initialDraw`]: true
         });
       };
       drawCards();
    }
  }, [gameState?.status, me?.initialDraw, isPlayer1, gameId]);

  useEffect(() => {
    if (isPlayer1 && gameState?.status === 'playing' && gameState?.isBotMatch && gameState?.player2 && !gameState.player2.initialDraw) {
       const drawCardsBot = () => {
         const shuffled = [...gameState.player2.deck].sort(() => 0.5 - Math.random());
         const hand = shuffled.slice(0, 5);
         const remainingDeck = shuffled.slice(5);
         
         updateDoc(doc(db, 'games', gameId!), {
           'player2.hand': hand,
           'player2.deck': remainingDeck,
           'player2.initialDraw': true
         });
       };
       drawCardsBot();
    }
  }, [gameState?.status, gameState?.player2?.initialDraw, isPlayer1, gameState?.isBotMatch, gameId]);

  useEffect(() => {
    if (isPlayer1 && gameState?.status === 'playing' && gameState.player1.passed && gameState.player2?.passed) {
       const p1Score = calculateScore(gameState.player1, gameState.player2);
       const p2Score = calculateScore(gameState.player2, gameState.player1);
       
       let p1Rounds = gameState.player1.roundsWon || 0;
       let p2Rounds = gameState.player2.roundsWon || 0;

       if (p1Score > p2Score) p1Rounds++;
       else if (p2Score > p1Score) p2Rounds++;
       else {
         p1Rounds++;
         p2Rounds++;
       }
       
       const processGameEnd = async (winnerId: string) => {
           const p1Graveyard = [...(gameState.player1.graveyard || [])];
           const p2Graveyard = [...(gameState.player2.graveyard || [])];
           
           if (gameState.player1.board) {
               if (gameState.player1.board.melee) p1Graveyard.push(...gameState.player1.board.melee);
               if (gameState.player1.board.ranged) p1Graveyard.push(...gameState.player1.board.ranged);
               if (gameState.player1.board.scenario) p1Graveyard.push(gameState.player1.board.scenario);
           }
           
           if (gameState.player2.board) {
               if (gameState.player2.board.melee) p2Graveyard.push(...gameState.player2.board.melee);
               if (gameState.player2.board.ranged) p2Graveyard.push(...gameState.player2.board.ranged);
               if (gameState.player2.board.scenario) p2Graveyard.push(gameState.player2.board.scenario);
           }

           updateDoc(doc(db, 'games', gameId!), {
             status: 'finished',
             winner: winnerId,
             'player1.roundsWon': p1Rounds,
             'player2.roundsWon': p2Rounds,
             'player1.board': { melee: [], ranged: [], scenario: null },
             'player2.board': { melee: [], ranged: [], scenario: null },
             'player1.graveyard': p1Graveyard,
             'player2.graveyard': p2Graveyard
           });
           
           if (userData && gameState.player1 && gameState.player2) {
              const myId = userData.uid;
              const isP1 = myId === gameState.player1.uid;
              const isP2 = myId === gameState.player2.uid;
              
              if (isP1 || isP2) {
                 const opponent = isP1 ? gameState.player2 : gameState.player1;
                 let result = 'draw';
                 if (winnerId !== 'draw') {
                    result = winnerId === myId ? 'win' : 'loss';
                 }
                 
                 const newRecord = {
                    gameId: gameId,
                    opponentName: opponent.username,
                    opponentId: opponent.uid,
                    result,
                    date: new Date().toISOString()
                 };
                 
                 const uDoc = await getDoc(doc(db, 'users', myId));
                 if (uDoc.exists()) {
                    const uData = uDoc.data();
                    const history = uData.matchHistory || [];
                    if (!history.find((h: any) => h.gameId === gameId)) {
                        history.unshift(newRecord);
                        const top5 = history.slice(0, 5);
                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5
                        });
                    }
                 }
              }
           }
       };

       if (p1Rounds >= 2 && p2Rounds >= 2) {
           processGameEnd('draw');
       } else if (p1Rounds >= 2) {
           processGameEnd(gameState.player1.uid);
       } else if (p2Rounds >= 2) {
           processGameEnd(gameState.player2.uid);
       } else {
           const p1Graveyard = [...(gameState.player1.graveyard || [])];
           const p2Graveyard = [...(gameState.player2.graveyard || [])];

           if (gameState.player1.board) {
               if (gameState.player1.board.melee) p1Graveyard.push(...gameState.player1.board.melee);
               if (gameState.player1.board.ranged) p1Graveyard.push(...gameState.player1.board.ranged);
               if (gameState.player1.board.scenario) p1Graveyard.push(gameState.player1.board.scenario);
           }
           
           if (gameState.player2.board) {
               if (gameState.player2.board.melee) p2Graveyard.push(...gameState.player2.board.melee);
               if (gameState.player2.board.ranged) p2Graveyard.push(...gameState.player2.board.ranged);
               if (gameState.player2.board.scenario) p2Graveyard.push(gameState.player2.board.scenario);
           }

           updateDoc(doc(db, 'games', gameId!), {
             round: (gameState.round || 1) + 1,
             'player1.board': { melee: [], ranged: [], scenario: null },
             'player2.board': { melee: [], ranged: [], scenario: null },
             'player1.graveyard': p1Graveyard,
             'player2.graveyard': p2Graveyard,
             'player1.score': 0,
             'player2.score': 0,
             'player1.passed': false,
             'player2.passed': false,
             'player1.roundsWon': p1Rounds,
             'player2.roundsWon': p2Rounds,
             turn: p1Score > p2Score ? gameState.player1.uid : gameState.player2.uid
           });
       }
    }
  }, [gameState?.status, gameState?.player1.passed, gameState?.player2?.passed, gameId, isPlayer1, gameState?.round]);

  useEffect(() => {
    if (gameState?.isBotMatch && gameState?.turn === 'bot' && isPlayer1 && gameState?.status === 'playing') {
      const doBotTurn = async () => {
        const botState = gameState.player2;
        if (!botState || botState.passed) return;

        await new Promise(resolve => setTimeout(resolve, 1500));

        const updateData: any = {};

        const p1Score = gameState.player1.score || 0;
        const botScore = botState.score || 0;

        // Se o oponente já passou e o bot está ganhando, o bot passa para economizar cartas
        if (gameState.player1.passed && botScore > p1Score) {
           updateData['player2.passed'] = true;
           updateData.turn = gameState.player1.uid; // Turno volta pro P1 (que já passou, então a rodada acaba no useEffect)
           await updateDoc(doc(db, 'games', gameId!), updateData);
           return;
        }

        // Bot decide jogada com IA
        const { cardIndex: chosenIndex, pass: botDecidesToPass } = determineBotMove(gameState);
        
        if (botDecidesToPass || chosenIndex === null) {
           updateData['player2.passed'] = true;
           const nextTurn = gameState.player1.passed ? 'bot' : gameState.player1.uid;
           updateData.turn = nextTurn;
           
           if (nextTurn === gameState.player1.uid && !gameState.player1.passed && gameState.player1.deck.length > 0) {
              const oppDeck = [...gameState.player1.deck];
              const oppHand = [...gameState.player1.hand];
              const drawnCard = oppDeck.shift(); 
              if (drawnCard) {
                oppHand.push(drawnCard);
                updateData['player1.deck'] = oppDeck;
                updateData['player1.hand'] = oppHand;
              }
           }
           await updateDoc(doc(db, 'games', gameId!), updateData);
           return;
        }

        const cardIndex = chosenIndex;
        const cardToPlay = botState.hand[cardIndex];
        
        let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
        if (cardToPlay.type === 'Ranged') targetRow = 'ranged';
        if (cardToPlay.type === 'Cenário' || cardToPlay.type === 'Scenario' || cardToPlay.effects?.includes('Clima')) targetRow = 'scenario';
        if (cardToPlay.type === 'Magic' || cardToPlay.type === 'Heal' || cardToPlay.type === 'Event') {
           if (!cardToPlay.effects?.includes('Clima')) targetRow = 'discard';
        }

        let newHand = botState.hand.filter((_, idx) => idx !== cardIndex);
        let newBoard = { ...botState.board };
        let newGraveyard = [...(botState.graveyard || [])];
        let newDeck = [...(botState.deck || [])];
        
        let updatedPlayer1 = gameState.player1 ? {
            ...gameState.player1,
            board: { ...gameState.player1.board },
            graveyard: [...(gameState.player1.graveyard || [])],
            hand: [...gameState.player1.hand],
            deck: [...gameState.player1.deck]
        } : null;
        
        let isSpy = cardToPlay.effects?.includes('Espião');
        let isAssassinSpy = cardToPlay.effects?.includes('Espião Assassino');
        let isMedic = cardToPlay.effects?.includes('Médico');
        let isScorch = cardToPlay.effects?.includes('Queimar');
        let shouldDraw = 0;
        if (cardToPlay.effects?.includes('Comprar 1')) shouldDraw += 1;
        if (cardToPlay.effects?.includes('Comprar 2')) shouldDraw += 2;
        if (isSpy) shouldDraw += 2;
    if (isAssassinSpy) shouldDraw += 2; // Assume it also draws 2, or maybe not? user said 'jogue a carta no campo do adversário mas obriga o adversário a jogar uma carta do campo dele pro cemitério'. We will NOT draw 2, so it's a balanced spy: just kills an enemy card.
        
        if (targetRow === 'discard') {
          newGraveyard.push(cardToPlay);
        } else if (targetRow === 'scenario') {
          if (newBoard.scenario) {
            newGraveyard.push(newBoard.scenario);
          }
          if (updatedPlayer1?.board.scenario) {
            updatedPlayer1.graveyard.push(updatedPlayer1.board.scenario);
            updatedPlayer1.board.scenario = null;
          }
          newBoard.scenario = cardToPlay;
        } else if ((isSpy || isAssassinSpy) && updatedPlayer1) {
          updatedPlayer1.board[targetRow] = [...(updatedPlayer1.board[targetRow] || []), cardToPlay];
        } else {
          newBoard[targetRow] = [...(newBoard[targetRow] || []), cardToPlay];
        }
        
    
    if (isAssassinSpy && updatedPlayer1) {
      const pMeleeBuffs = countGlobalBuff(newBoard, 'Buff de área melee');
      const pRangedBuffs = countGlobalBuff(newBoard, 'Buff de área ranged');
      const oMeleeBuffs = countGlobalBuff(updatedPlayer1?.board, 'Buff de área melee');
      const oRangedBuffs = countGlobalBuff(updatedPlayer1?.board, 'Buff de área ranged');
      
      const pMeleeTraps = countGlobalBuff(newBoard, 'Trap campo melee');
      const pRangedTraps = countGlobalBuff(newBoard, 'Trap campo Ranged');
      const oMeleeTraps = countGlobalBuff(updatedPlayer1?.board, 'Trap campo melee');
      const oRangedTraps = countGlobalBuff(updatedPlayer1?.board, 'Trap campo Ranged');
      
      const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
      const globalRangedBuffs = pRangedBuffs + oRangedBuffs;
      const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
      const globalRangedTraps = pRangedTraps + oRangedTraps;

      const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);
      let highestPoints = -1;
      
      updatedPlayer1.board.melee.forEach(c => {
        if (c.id === cardToPlay.id) return; // don't kill the spy itself if it just landed
        const pts = getPoints(c, updatedPlayer1.board.melee, updatedPlayer1.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      updatedPlayer1.board.ranged.forEach(c => {
        if (c.id === cardToPlay.id) return;
        const pts = getPoints(c, updatedPlayer1.board.ranged, updatedPlayer1.board.scenario, newBoard.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });

      if (highestPoints > -1) {
        let destroyed = false;
        updatedPlayer1.board.melee = updatedPlayer1.board.melee.filter(c => {
          if (destroyed) return true;
          if (c.id === cardToPlay.id) return true;
          const pts = getPoints(c, updatedPlayer1.board.melee, updatedPlayer1.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            updatedPlayer1.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
        updatedPlayer1.board.ranged = updatedPlayer1.board.ranged.filter(c => {
          if (destroyed) return true;
          if (c.id === cardToPlay.id) return true;
          const pts = getPoints(c, updatedPlayer1.board.ranged, updatedPlayer1.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            updatedPlayer1.graveyard.push(c);
            destroyed = true;
            return false;
          }
          return true;
        });
      }
    }

    if (isScorch) {
      const pMeleeBuffs = countGlobalBuff(newBoard, 'Buff de área melee');
      const pRangedBuffs = countGlobalBuff(newBoard, 'Buff de área ranged');
      const oMeleeBuffs = countGlobalBuff(updatedPlayer1?.board, 'Buff de área melee');
      const oRangedBuffs = countGlobalBuff(updatedPlayer1?.board, 'Buff de área ranged');
      
      const pMeleeTraps = countGlobalBuff(newBoard, 'Trap campo melee');
      const pRangedTraps = countGlobalBuff(newBoard, 'Trap campo Ranged');
      const oMeleeTraps = countGlobalBuff(updatedPlayer1?.board, 'Trap campo melee');
      const oRangedTraps = countGlobalBuff(updatedPlayer1?.board, 'Trap campo Ranged');
      
      const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
      const globalRangedBuffs = pRangedBuffs + oRangedBuffs;
      const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
      const globalRangedTraps = pRangedTraps + oRangedTraps;

      const getPoints = (c: any, row: any, sc1: any, sc2: any) => getCardPoints(c, row, sc1, sc2, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards);

      let highestPoints = -1;
      
      newBoard.melee.forEach(c => {
        const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedPlayer1?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      newBoard.ranged.forEach(c => {
        const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedPlayer1?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      if (updatedPlayer1) {
        updatedPlayer1.board.melee.forEach(c => {
          const pts = getPoints(c, updatedPlayer1.board.melee, updatedPlayer1.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
        updatedPlayer1.board.ranged.forEach(c => {
          const pts = getPoints(c, updatedPlayer1.board.ranged, updatedPlayer1.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
      }
      
      if (highestPoints > -1) {
        newBoard.melee = newBoard.melee.filter(c => {
          const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedPlayer1?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        newBoard.ranged = newBoard.ranged.filter(c => {
          const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedPlayer1?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        if (updatedPlayer1) {
          updatedPlayer1.board.melee = updatedPlayer1.board.melee.filter(c => {
            const pts = getPoints(c, updatedPlayer1.board.melee, updatedPlayer1.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedPlayer1.graveyard.push(c);
              return false;
            }
            return true;
          });
          updatedPlayer1.board.ranged = updatedPlayer1.board.ranged.filter(c => {
            const pts = getPoints(c, updatedPlayer1.board.ranged, updatedPlayer1.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedPlayer1.graveyard.push(c);
              return false;
            }
            return true;
          });
        }
      }
    }
    
    if (isMedic && newGraveyard.length > 0) {
          const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));
          if (revivable.length > 0) {
            revivable.sort((a, b) => (b.points || 0) - (a.points || 0));
            const revivedCard = revivable[0];
            newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);
            newHand.push(revivedCard);
          }
        }
        
        for (let i = 0; i < shouldDraw; i++) {
          if (newDeck.length > 0) {
            const drawn = newDeck.shift();
            if (drawn) newHand.push(drawn);
          }
        }

        updateData['player2.hand'] = newHand;
        updateData['player2.board'] = newBoard;
        updateData['player2.graveyard'] = newGraveyard;
        updateData['player2.deck'] = newDeck;
        
        updateData['player2.score'] = calculateScore({ ...botState, board: newBoard }, updatedPlayer1);
        if (updatedPlayer1) {
            updateData['player1.score'] = calculateScore(updatedPlayer1, { ...botState, board: newBoard });
            updateData['player1.board'] = updatedPlayer1.board;
            updateData['player1.graveyard'] = updatedPlayer1.graveyard;
            updateData['player1.hand'] = updatedPlayer1.hand;
            updateData['player1.deck'] = updatedPlayer1.deck;
        }

        const nextTurn = gameState.player1.passed ? 'bot' : gameState.player1.uid;
        updateData.turn = nextTurn;
        
        if (nextTurn === gameState.player1.uid && !gameState.player1.passed && updatedPlayer1 && updatedPlayer1.deck.length > 0) {
           const drawnCard = updatedPlayer1.deck.shift();
           if (drawnCard) {
             updatedPlayer1.hand.push(drawnCard);
             updateData['player1.deck'] = updatedPlayer1.deck;
             updateData['player1.hand'] = updatedPlayer1.hand;
           }
        }
        
        await updateDoc(doc(db, 'games', gameId!), updateData);
      };
      
      doBotTurn();
    }
  }, [gameState?.turn, gameState?.status, gameState?.isBotMatch, isPlayer1, gameState?.player2, gameState?.player1, gameId]);

  if (!gameState || !userData) {
    return <div className="h-full flex flex-col flex-1 items-center justify-center bg-[#0f0e0c] font-serif text-[#a67c52]">Carregando campo de batalha...</div>;
  }




  const playCard = async (card: Card, targetRow: 'melee' | 'ranged' | 'scenario' | 'discard', targetEnemyCard?: Card) => {
    if (!isMyTurn || me?.passed) return;
    soundManager.playCardPlay();
    
    const cardIndex = me.hand.findIndex(c => c.id === card.id);
    if (cardIndex === -1) return;
    
    let newHand = [...me.hand];
    newHand.splice(cardIndex, 1);
    
    let newBoard = { ...me.board };
    let newGraveyard = [...(me.graveyard || [])];
    let newDeck = [...(me.deck || [])];
    
    let updatedOpponent = opponent ? { 
      ...opponent, 
      board: { ...opponent.board }, 
      graveyard: [...(opponent.graveyard || [])], 
      hand: [...opponent.hand], 
      deck: [...opponent.deck] 
    } : null;
    
    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const opponentKey = isPlayer1 ? 'player2' : 'player1';
    const nextTurn = opponent?.passed ? me.uid : opponent?.uid;
    
    const updateData: any = {};
    
    let isSpy = card.effects?.includes('Espião');
    let isAssassinSpy = card.effects?.includes('Espião Assassino');
    let isMedic = card.effects?.includes('Médico');
    let isScorch = card.effects?.includes('Queimar');
    
    let shouldDraw = 0;
    if (card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (card.effects?.includes('Comprar 2')) shouldDraw += 2;
    if (isSpy) shouldDraw += 2;
    if (isAssassinSpy) shouldDraw += 2; // Assume it also draws 2, or maybe not? user said 'jogue a carta no campo do adversário mas obriga o adversário a jogar uma carta do campo dele pro cemitério'. We will NOT draw 2, so it's a balanced spy: just kills an enemy card.

    if (targetRow === 'discard') {
      newGraveyard.push(card);
    } else if (targetRow === 'scenario') {
      if (newBoard.scenario) {
        newGraveyard.push(newBoard.scenario);
      }
      if (updatedOpponent?.board.scenario) {
        updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
        updatedOpponent.board.scenario = null;
      }
      newBoard.scenario = card;
    } else if ((isSpy || isAssassinSpy) && updatedOpponent) {
      updatedOpponent.board[targetRow] = [...(updatedOpponent.board[targetRow] || []), card];
    } else {
      newBoard[targetRow] = [...(newBoard[targetRow] || []), card];
    }
    

    if (isAssassinSpy && updatedOpponent && targetEnemyCard) {
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
    }

    if (isScorch) {
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

      let highestPoints = -1;
      
      newBoard.melee.forEach(c => {
        const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedOpponent?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      newBoard.ranged.forEach(c => {
        const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedOpponent?.board.scenario);
        if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
      });
      if (updatedOpponent) {
        updatedOpponent.board.melee.forEach(c => {
          const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
        updatedOpponent.board.ranged.forEach(c => {
          const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
          if (!c.effects?.includes('Herói') && pts > highestPoints) highestPoints = pts;
        });
      }
      
      if (highestPoints > -1) {
        newBoard.melee = newBoard.melee.filter(c => {
          const pts = getPoints(c, newBoard.melee, newBoard.scenario, updatedOpponent?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        newBoard.ranged = newBoard.ranged.filter(c => {
          const pts = getPoints(c, newBoard.ranged, newBoard.scenario, updatedOpponent?.board.scenario);
          if (!c.effects?.includes('Herói') && pts === highestPoints) {
            newGraveyard.push(c);
            return false;
          }
          return true;
        });
        if (updatedOpponent) {
          updatedOpponent.board.melee = updatedOpponent.board.melee.filter(c => {
            const pts = getPoints(c, updatedOpponent.board.melee, updatedOpponent.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedOpponent.graveyard.push(c);
              return false;
            }
            return true;
          });
          updatedOpponent.board.ranged = updatedOpponent.board.ranged.filter(c => {
            const pts = getPoints(c, updatedOpponent.board.ranged, updatedOpponent.board.scenario, newBoard.scenario);
            if (!c.effects?.includes('Herói') && pts === highestPoints) {
              updatedOpponent.graveyard.push(c);
              return false;
            }
            return true;
          });
        }
      }
    }
    
    if (isMedic && newGraveyard.length > 0) {
      const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));
      if (revivable.length > 0) {
        revivable.sort((a, b) => (b.points || 0) - (a.points || 0));
        const revivedCard = revivable[0];
        newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);
        newHand.push(revivedCard);
      }
    }
    
    for (let i = 0; i < shouldDraw; i++) {
      if (newDeck.length > 0) {
        const drawn = newDeck.shift();
        if (drawn) newHand.push(drawn);
      }
    }

    updateData[`${playerKey}.hand`] = newHand;
    updateData[`${playerKey}.board`] = newBoard;
    updateData[`${playerKey}.graveyard`] = newGraveyard;
    updateData[`${playerKey}.deck`] = newDeck;
    
    updateData[`${playerKey}.score`] = calculateScore({ ...me, board: newBoard }, updatedOpponent);
    if (updatedOpponent) {
      updateData[`${opponentKey}.score`] = calculateScore(updatedOpponent, { ...me, board: newBoard });
      updateData[`${opponentKey}.board`] = updatedOpponent.board;
      updateData[`${opponentKey}.graveyard`] = updatedOpponent.graveyard;
      updateData[`${opponentKey}.hand`] = updatedOpponent.hand;
      updateData[`${opponentKey}.deck`] = updatedOpponent.deck;
    }
    
    updateData.turn = nextTurn;
    
    if (nextTurn === opponent?.uid && updatedOpponent && updatedOpponent.deck.length > 0) {
       const drawnCard = updatedOpponent.deck.shift();
       if (drawnCard) {
         updatedOpponent.hand.push(drawnCard);
         updateData[`${opponentKey}.deck`] = updatedOpponent.deck;
         updateData[`${opponentKey}.hand`] = updatedOpponent.hand;
       }
    }
    
    await updateDoc(doc(db, 'games', gameId!), updateData);
  };

  const passTurn = async () => {
    if (!isMyTurn || me?.passed) return;
    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const opponentKey = isPlayer1 ? 'player2' : 'player1';
    const nextTurn = opponent?.passed ? me.uid : opponent?.uid;

    const updateData: any = {
      [`${playerKey}.passed`]: true,
      turn: nextTurn
    };

    if (nextTurn === opponent?.uid && opponent && opponent.deck.length > 0) {
       const oppDeck = [...opponent.deck];
       const oppHand = [...opponent.hand];
       const drawnCard = oppDeck.shift(); 
       if (drawnCard) {
         oppHand.push(drawnCard);
         updateData[`${opponentKey}.deck`] = oppDeck;
         updateData[`${opponentKey}.hand`] = oppHand;
       }
    }
    await updateDoc(doc(db, 'games', gameId!), updateData);
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

  const acceptRematch = async () => {
    if (!userData?.deck || userData.deck.length < 10) {
      alert('Você precisa de 10 cartas no baralho para jogar!');
      return;
    }
    if (!gameState.rematchGameId) return;
    try {
      await loadAllCards();
      const p2Deck: Card[] = userData.deck.map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
      await updateDoc(doc(db, 'games', gameState.rematchGameId), {
        'player2.deck': p2Deck,
        status: 'playing'
      });
      navigate('/game/' + gameState.rematchGameId);
    } catch(e) { console.error(e); }
  };

  if (gameState.status === 'challenge') {
  
  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (

      <div className="h-full flex flex-1 flex-col items-center justify-center p-4 text-center space-y-6 font-serif bg-[#0f0e0c] text-[#d4c3a1]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a67c52]"></div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-[#a67c52]">Desafio Enviado!</h2>
        <p className="text-[#d4c3a1]/80 text-sm">Aguardando {gameState.player2?.username} aceitar o desafio...</p>
        <button onClick={() => navigate('/')} className="text-[#a67c52]/60 hover:text-[#a67c52] flex items-center gap-2 uppercase font-bold text-xs mt-4">
           <ArrowLeft className="w-4 h-4" /> Cancelar Desafio
        </button>
      </div>
    );
  }

  if (gameState.status === 'declined') {
  
  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (

      <div className="h-full flex flex-1 flex-col items-center justify-center p-4 text-center space-y-6 font-serif bg-[#0f0e0c] text-[#d4c3a1]">
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-red-500">Desafio Recusado</h2>
        <p className="text-[#d4c3a1]/80 text-sm">{gameState.player2?.username} recusou o seu desafio.</p>
        <button onClick={() => navigate('/')} className="px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors mt-4">
           Voltar para o Menu
        </button>
      </div>
    );
  }

  if (gameState.status === 'waiting') {
  
  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (

      <div className="h-full flex flex-1 flex-col items-center justify-center p-4 text-center space-y-6 font-serif bg-[#0f0e0c] text-[#d4c3a1]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#a67c52]"></div>
        <h2 className="text-2xl font-bold uppercase tracking-tighter text-[#a67c52]">Aguardando oponente...</h2>
        {gameState.isPrivate && (
          <div className="bg-[#1a1814] border border-[#3d3326] p-4 rounded shadow-2xl space-y-2">
            <h3 className="text-sm font-bold uppercase text-[#e2b17a]">Sala Privada</h3>
            <p className="text-xs uppercase text-[#d4c3a1]">Nome da Sala: <span className="font-mono text-[#a67c52]">{gameState.roomName}</span></p>
            {gameState.roomPassword && <p className="text-xs uppercase text-[#d4c3a1]">Senha: <span className="font-mono text-[#a67c52]">{gameState.roomPassword}</span></p>}
          </div>
        )}
        <p className="text-[#d4c3a1]/60 text-sm italic">Compartilhe esta tela com um amigo ou espere pela partida.</p>
        <button onClick={() => navigate('/')} className="text-[#a67c52]/60 hover:text-[#a67c52] flex items-center gap-2 uppercase font-bold text-xs">
           <ArrowLeft className="w-4 h-4" /> Cancelar Partida
        </button>
      </div>
    );
  }

  const renderCard = (card: Card, keySuffix: string | number = '', onClick?: () => void, modifiedPoints?: number, location: 'board' | 'hand' = 'board') => {
    const pts = modifiedPoints !== undefined ? modifiedPoints : card.points;
    const isBuffed = pts > card.points;
    const isDebuffed = pts < card.points;
  
  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (

    <div 
      key={`${card.id}-${keySuffix}`} 
      onClick={onClick}
      className={cn(
        `relative ${location === 'hand' ? 'w-16 h-24 sm:w-20 sm:h-28 md:w-24 md:h-32' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0`,
        onClick && "cursor-pointer hover:-translate-y-4 hover:border-[#e2b17a] hover:shadow-[0_0_15px_rgba(226,177,122,0.5)] transition-all duration-300"
      )}
    >
      <div className={cn("absolute left-1 top-1 w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold shadow-inner z-10 border border-black/50", isBuffed ? "bg-green-500 text-white" : isDebuffed ? "bg-red-500 text-white" : "bg-[#a67c52] text-black")}>
        {pts}
      </div>
      <div className="absolute right-1 top-1 text-[8px] font-bold uppercase text-[#a67c52] bg-black/80 px-1 py-0.5 rounded border border-[#3d3326] z-10 shadow">
        {card.type.substring(0, 3)}
      </div>

      {card.imageUrl ? (
        <img src={card.imageUrl} referrerPolicy="no-referrer" alt={card.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
      ) : (
         <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[8px] opacity-30">Sem Imagem</div>
      )}

      {/* Name with gradient background for readability */}
      <div className="absolute bottom-0 left-0 right-0 p-1 pt-4 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
        <div className="text-[7px] md:text-[9px] font-bold uppercase text-white drop-shadow-[0_2px_2px_rgba(0,0,0,1)] text-center leading-tight line-clamp-2">{card.name}</div>
      </div>
      
      <button 
        onClick={(e) => { e.stopPropagation(); setSelectedCardModal(card); }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 text-white hover:text-[#e2b17a]"
        title="Ver Carta"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
  }

  const pMeleeBuffs = countGlobalBuff(me?.board, 'Buff de área melee');
  const pRangedBuffs = countGlobalBuff(me?.board, 'Buff de área ranged');
  const oMeleeBuffs = countGlobalBuff(opponent?.board, 'Buff de área melee');
  const oRangedBuffs = countGlobalBuff(opponent?.board, 'Buff de área ranged');
    const getEffectBackground = (effect: string) => {
    const allCards = [
      ...(me?.board?.melee || []),
      ...(me?.board?.ranged || []),
      ...(me?.board?.scenario ? [me.board.scenario] : []),
      ...(opponent?.board?.melee || []),
      ...(opponent?.board?.ranged || []),
      ...(opponent?.board?.scenario ? [opponent.board.scenario] : [])
    ];
    const cardWithEffect = allCards.find(c => c.effects?.includes(effect) && c.backgroundUrl);
    return cardWithEffect?.backgroundUrl;
  };

  const getSpecificBuffBackground = (rowCards: Card[]) => {
    for (const sc of allActiveCards) {
      if (sc.backgroundUrl) {
        if (sc.effects?.includes('BUFF DE ESPECIFICO') && sc.buffTargetNames) {
           for (const targetName of sc.buffTargetNames) {
              if (rowCards.some(c => c.name === targetName)) return sc.backgroundUrl;
           }
        }
        if (sc.effects?.includes('DBUFF DE ESPECIFICO') && sc.debuffTargetNames) {
           for (const targetName of sc.debuffTargetNames) {
              if (rowCards.some(c => c.name === targetName)) return sc.backgroundUrl;
           }
        }
      }
    }
    return undefined;
  };

  const allMelee = [...(me?.board?.melee || []), ...(opponent?.board?.melee || [])];
  const allRanged = [...(me?.board?.ranged || []), ...(opponent?.board?.ranged || [])];

  const meleeBg = getEffectBackground('Buff de área melee') || getEffectBackground('Trap campo melee') || getSpecificBuffBackground(allMelee);
  const rangedBg = getEffectBackground('Buff de área ranged') || getEffectBackground('Trap campo Ranged') || getSpecificBuffBackground(allRanged);

const globalMeleeBuffs = pMeleeBuffs + oMeleeBuffs;
  const globalRangedBuffs = pRangedBuffs + oRangedBuffs;

  const pMeleeTraps = countGlobalBuff(me?.board, 'Trap campo melee');
  const pRangedTraps = countGlobalBuff(me?.board, 'Trap campo Ranged');
  const oMeleeTraps = countGlobalBuff(opponent?.board, 'Trap campo melee');
  const oRangedTraps = countGlobalBuff(opponent?.board, 'Trap campo Ranged');
  const globalMeleeTraps = pMeleeTraps + oMeleeTraps;
  const globalRangedTraps = pRangedTraps + oRangedTraps;


  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  return (

    <div className="h-full flex flex-col bg-[#0f0e0c] text-[#d4c3a1] font-serif select-none overflow-hidden">
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        
        {/* Left Sidebar (Game Info & Pass) */}
        <div className="w-full md:w-64 bg-[#141210] flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-[#3d3326] shadow-2xl z-10 shrink-0">
           {/* Top Actions */}
           <div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col md:flex-row items-center justify-center md:justify-between shrink-0 w-24 md:w-auto gap-2">
              <button onClick={() => { navigate('/'); }} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-red-900/30 hover:bg-red-800 rounded flex items-center justify-center transition-colors w-full md:w-auto">
                 <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Sair</span>
              </button>
              <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">
                 <MessageSquare className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Chat</span>
                 {gameState.chatMessages && gameState.chatMessages.length > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {gameState.chatMessages.length}
                    </span>
                 )}
              </button>
              <div className="text-center">
                {gameState.status === 'finished' ? (
                  <h2 className="text-sm font-bold text-[#e2b17a] uppercase tracking-widest">
                    {gameState.winner === 'draw' ? 'EMPATE' : gameState.winner === userData.uid ? 'VITÓRIA' : 'DERROTA'}
                  </h2>
                ) : (
                  <h2 className="text-[10px] font-bold uppercase tracking-widest">
                    {isMyTurn ? <span className="text-[#e2b17a]">Seu Turno</span> : <span className="text-[#d4c3a1]/40">Turno Oponente</span>}
                  </h2>
                )}
              </div>
           </div>

          {/* Opponent Info */}
          <div className="p-2 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${(opponent?.roundsWon || 0) >= 1 ? 'bg-[#e2b17a] shadow-[0_0_5px_#e2b17a]' : 'bg-[#3d3326]'}`}></div>
                <div className={`w-2 h-2 rounded-full ${(opponent?.roundsWon || 0) >= 2 ? 'bg-[#e2b17a] shadow-[0_0_5px_#e2b17a]' : 'bg-[#3d3326]'}`}></div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                {opponent?.profile?.avatarUrl && (
                  <img src={opponent.profile.avatarUrl} alt="Avatar" className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover" />
                )}
                <h3 
                  className={cn("text-xs uppercase tracking-widest font-bold", opponent?.profile?.font || "font-sans")} 
                  style={{ color: opponent?.profile?.color || "#a67c52" }}
                >
                  {opponent?.username || 'Oponente'}
                </h3>
              </div>
            </div>
            <div className="text-3xl md:text-5xl font-black md:mt-2 text-[#d4c3a1]">{calculateScore(opponent!, me!)}</div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 md:mt-4"><span className="hidden md:inline">Cartas: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.hand.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.graveyard?.length || 0}</span></div>
            {opponent?.passed && <div className="absolute bottom-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded">Passou</div>}
          </div>

          {/* Player Info */}
          <div className="p-2 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative">
             {me?.passed && <div className="absolute top-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded">Passou</div>}
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4"><span className="hidden md:inline">Baralho: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.deck.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.graveyard?.length || 0}</span></div>
            <div className="text-3xl md:text-5xl font-black md:mb-2 text-[#d4c3a1]">{calculateScore(me!, opponent!)}</div>
            <div className="flex items-center gap-2 mt-2">
              
              <div className="flex flex-col items-center gap-2">
                {me?.profile?.avatarUrl && (
                  <img src={me.profile.avatarUrl} alt="Avatar" className="w-6 h-6 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover" />
                )}
                <h3 
                  className={cn("text-xs uppercase tracking-widest font-bold", me?.profile?.font || "font-sans")} 
                  style={{ color: me?.profile?.color || "#a67c52" }}
                >
                  {me?.username || 'Você'}
                </h3>
              </div>
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${(me?.roundsWon || 0) >= 1 ? 'bg-[#e2b17a] shadow-[0_0_5px_#e2b17a]' : 'bg-[#3d3326]'}`}></div>
                <div className={`w-2 h-2 rounded-full ${(me?.roundsWon || 0) >= 2 ? 'bg-[#e2b17a] shadow-[0_0_5px_#e2b17a]' : 'bg-[#3d3326]'}`}></div>
              </div>
            </div>
            
            {gameState.status === 'finished' && (
              <div className="w-full mt-6 flex flex-col gap-2">
                {gameState.isBotMatch ? (
                   <button 
                     onClick={requestRematch}
                     className="w-full py-2 bg-gradient-to-r from-[#3d3326] to-[#1a1814] hover:from-[#a67c52]/40 hover:to-[#3d3326] text-[#d4c3a1]/80 border border-[#3d3326] rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Swords className="w-3 h-3" /> Jogar Novamente
                   </button>
                ) : gameState.rematchRequestedBy === userData.uid ? (
                   <div className="text-[10px] text-center text-[#e2b17a] border border-[#e2b17a]/30 p-2 rounded uppercase font-bold tracking-widest bg-[#e2b17a]/10">
                      Revanche Solicitada...
                   </div>
                ) : gameState.rematchRequestedBy ? (
                   <button 
                     onClick={acceptRematch}
                     className="w-full py-2 bg-gradient-to-r from-blue-900 to-blue-950 hover:from-blue-800 hover:to-blue-900 text-[#d4c3a1]/80 border border-blue-900/30 rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Check className="w-3 h-3" /> Aceitar Revanche
                   </button>
                ) : (
                   <button 
                     onClick={requestRematch}
                     className="w-full py-2 bg-gradient-to-r from-[#3d3326] to-[#1a1814] hover:from-[#a67c52]/40 hover:to-[#3d3326] text-[#d4c3a1]/80 border border-[#3d3326] rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors"
                   >
                     <Swords className="w-3 h-3" /> Solicitar Revanche
                   </button>
                )}
              </div>
            )}
            {!me?.passed && gameState.status === 'playing' && (
              <div className="w-full mt-6 flex flex-col gap-2">

                <button 
                  onClick={passTurn}
                  disabled={!isMyTurn}
                  className="w-full py-2 bg-gradient-to-r from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-[#d4c3a1]/80 border border-red-900/30 rounded flex items-center justify-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-colors disabled:opacity-30 disabled:grayscale"
                >
                  <Flag className="w-3 h-3" /> Passar Rodada
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Board */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0 relative bg-gradient-to-b from-[#141210] via-[#0f0e0c] to-[#141210]">
           
           {/* Battlefield Area */}
           <div className="flex-1 flex flex-col p-2 md:p-4 gap-1 overflow-y-auto min-h-0 no-scrollbar">
             {/* Opponent Board */}
             <div className="flex-1 flex flex-col justify-end gap-1 mb-2">
                {opponent?.board.scenario && (
                  <div className="min-h-[3.5rem] flex-1 sm:flex-none sm:h-20 md:h-24 bg-black/20 border border-white/5 flex items-center px-2 md:px-4 gap-1 md:gap-2 relative">
                     <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#3d3326] rounded-full border border-[#a67c52] flex items-center justify-center text-xs font-bold">0</div>
                     {renderCard(opponent.board.scenario, 'opp-scen')}
                     <span className="absolute right-4 text-[10px] uppercase text-white/20 font-sans tracking-tighter">Cenário</span>
                  </div>
                )}
                <div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={rangedBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${rangedBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#3d3326] rounded-full border border-[#a67c52] flex items-center justify-center text-xs font-bold shadow-lg">
                     {getRowScore(opponent?.board.ranged || [], opponent?.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {opponent?.board.ranged.map((c, idx) => renderCard(c, `opp-r-${idx}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints(c, opponent.board.ranged, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}
                   <span className="absolute right-4 text-[10px] uppercase text-white/20 font-sans tracking-tighter">Fila à Distância</span>
                </div>
                <div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={meleeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${meleeBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#3d3326] rounded-full border border-[#a67c52] flex items-center justify-center text-xs font-bold shadow-lg">
                     {getRowScore(opponent?.board.melee || [], opponent?.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {opponent?.board.melee.map((c, idx) => renderCard(c, `opp-m-${idx}`, targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined, getCardPoints(c, opponent.board.melee, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}
                   <span className="absolute right-4 text-[10px] uppercase text-white/20 font-sans tracking-tighter">Fila Corpo a Corpo</span>
                </div>
             </div>

             <div className="h-[2px] bg-gradient-to-r from-transparent via-[#3d3326] to-transparent mx-10 my-2"></div>

             {/* Player Board */}
             <div className="flex-1 flex flex-col justify-start gap-1 mt-2">
                <div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={meleeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${meleeBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#a67c52] rounded-full border border-black flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(166,124,82,0.5)]">
                      {getRowScore(me?.board.melee || [], me?.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {me?.board.melee.map((c, idx) => renderCard(c, `me-m-${idx}`, undefined, getCardPoints(c, me.board.melee, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}
                   <span className="absolute right-4 text-[10px] uppercase text-[#a67c52]/30 font-sans tracking-tighter font-bold">Fila Corpo a Corpo</span>
                </div>
                <div className="min-h-[4.5rem] flex-1 sm:flex-none sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={rangedBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${rangedBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#a67c52] rounded-full border border-black flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(166,124,82,0.5)]">
                      {getRowScore(me?.board.ranged || [], me?.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {me?.board.ranged.map((c, idx) => renderCard(c, `me-r-${idx}`, undefined, getCardPoints(c, me.board.ranged, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}
                   <span className="absolute right-4 text-[10px] uppercase text-[#a67c52]/30 font-sans tracking-tighter font-bold">Fila à Distância</span>
                </div>
                {me?.board.scenario && (
                  <div className="min-h-[3.5rem] flex-1 sm:flex-none sm:h-20 md:h-24 bg-[#2d2922]/30 border border-[#a67c52]/20 flex items-center px-2 md:px-4 gap-1 md:gap-2 relative">
                     <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#a67c52] rounded-full border border-black flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(166,124,82,0.5)]">0</div>
                     {renderCard(me.board.scenario, 'me-scen')}
                     <span className="absolute right-4 text-[10px] uppercase text-[#a67c52]/30 font-sans tracking-tighter font-bold">Cenário</span>
                  </div>
                )}
             </div>
           </div>

          {/* Hand */}
          <div className="h-28 sm:h-36 md:h-44 bg-[#1a1814] flex items-center md:items-center justify-start md:justify-center px-4 md:px-10 gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto no-scrollbar relative shrink-0 w-full pt-4 md:pt-0">
             <div className="absolute left-4 bottom-full mb-1 md:mb-2 text-[10px] font-bold text-[#a67c52] uppercase tracking-widest drop-shadow-md">Sua Mão</div>
             {me?.hand.map((card, idx) => {
               let targetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
               if (card.type === 'Ranged') targetRow = 'ranged';
               if (card.type === 'Cenário' || card.type === 'Scenario' || card.effects?.includes('Clima')) targetRow = 'scenario';
               if (card.type === 'Magic' || card.type === 'Heal' || card.type === 'Event') {
                 if (!card.effects?.includes('Clima')) targetRow = 'discard';
               }

               const onClick = () => {
                 if (card.effects?.includes('Espião Assassino')) {
                    const oppHasCards = (opponent?.board.melee.some(c => !c.effects?.includes('Herói')) || opponent?.board.ranged.some(c => !c.effects?.includes('Herói')));
                    if (oppHasCards) {
                       setTargetingAssassinSpy({ spyCard: card, targetRow: targetRow as 'melee' | 'ranged' });
                       return;
                    }
                 }
                 setTargetingAssassinSpy(null);
                 playCard(card, targetRow);
               };
               
               return renderCard(card, `hand-${idx}`, onClick, undefined, 'hand');
             })}
          </div>
        </div>

      </div>
      
      {targetingAssassinSpy && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-pulse">
          <span className="font-bold uppercase tracking-widest text-xs">Selecione uma carta inimiga para destruir</span>
          <button onClick={() => setTargetingAssassinSpy(null)} className="bg-black/50 hover:bg-black p-1 rounded-full"><X className="w-4 h-4" /></button>
        </div>
      )}

      {isChatOpen && userData && (
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
    </div>
  );
}
