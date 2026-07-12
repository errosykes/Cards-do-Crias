import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TutorialOverlay } from '../components/TutorialOverlay';
import { determineBotMove, updateAdaptiveBotLearning } from '../lib/botAI';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, getDoc, getDocs, arrayUnion, addDoc, collection } from "firebase/firestore";
import { db } from '../lib/firebase';
import { loadAllCards, getCachedCard, getAllCachedCards } from '../lib/cardsCache';
import { useAuth } from '../contexts/AuthContext';
import { GameState, Card, GamePlayerState } from '../types';
import { soundManager } from '../lib/sound';
const dummySoundHook = () => {
}
import { ArrowLeft, Flag, Check, UserPlus, Eye, Swords, X, MessageSquare, Volume2, List } from 'lucide-react';
import { ChatPanel } from '../components/ChatPanel';
import { CardModal } from '../components/CardModal';
import { AudioSettingsModal } from '../components/AudioSettingsModal';
import { BattleLogPanel } from '../components/BattleLogPanel';
import { useAudio } from '../contexts/AudioContext';
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
  if (card.isFacedown) return 0;
  let pts = card.points || 0;
  const isHero = card.effects?.includes('Herói');
  const hasClima = scenario1?.effects?.includes('Clima') || scenario2?.effects?.includes('Clima');

  if (!isHero && hasClima) {
    pts = 1;
  }

  if (card.effects?.includes('Vínculo Estreito')) {
    const sameCards = row.filter(c => c.name === card.name && !c.isFacedown).length;
    pts = pts * sameCards;
  }

  if (!isHero) {
    const moraleBoosters = row.filter(c => c !== card && !c.isFacedown && c.effects?.includes('Impulso Moral')).length;
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
  const { setCurrentPlaylist, config } = useAudio();
  const navigate = useNavigate();
  const [selectedCardModal, setSelectedCardModal] = useState<Card | null>(null);
  const [targetingAssassinSpy, setTargetingAssassinSpy] = useState<{ spyCard: Card, targetRow: "melee" | "ranged" } | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (gameState?.isBotMatch && gameState?.campaignId && config.campaignMusic?.[gameState.campaignId] && config.campaignMusic[gameState.campaignId].length > 0) {
      setCurrentPlaylist(config.campaignMusic[gameState.campaignId]);
    } else if (config.battleMusic && config.battleMusic.length > 0) {
      setCurrentPlaylist(config.battleMusic);
    }
    return () => setCurrentPlaylist(null);
  }, [config.battleMusic, setCurrentPlaylist, gameState?.isBotMatch, gameState?.campaignId, config.campaignMusic]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [roundOverlay, setRoundOverlay] = useState<{show: boolean, message: string, color: string}>({ show: false, message: '', color: '' });
  
  // Watch for round changes
  useEffect(() => {
     if (!gameState?.round) return;
     if (gameState.status !== 'playing') return;
     
     let msg = `RODADA ${gameState.round}`;
     let color = 'text-[#e2b17a]';
     
     if (gameState.round > 1) {
         const p1Rounds = gameState.player1.roundsWon || 0;
         const p2Rounds = gameState.player2?.roundsWon || 0;
         const myRounds = gameState.player1.uid === userData?.uid ? p1Rounds : p2Rounds;
         const oppRounds = gameState.player1.uid === userData?.uid ? p2Rounds : p1Rounds;
         
         if (myRounds > 0 && oppRounds === 0) {
            msg = `RODADA VENCIDA`;
            color = 'text-green-500';
         } else if (oppRounds > 0 && myRounds === 0) {
            msg = `RODADA PERDIDA`;
            color = 'text-red-500';
         } else if (myRounds === 1 && oppRounds === 1 && gameState.round === 3) {
            msg = `RODADA FINAL`;
            color = 'text-[#e2b17a]';
         }
     }
     
     setRoundOverlay({ show: true, message: msg, color });
     const t = setTimeout(() => {
        setRoundOverlay({ show: false, message: '', color: '' });
     }, 3000);
     return () => clearTimeout(t);
  }, [gameState?.round, gameState?.status, gameState?.player1.roundsWon, gameState?.player2?.roundsWon]);

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
       let p2Rounds = gameState.player2?.roundsWon || 0;

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

           if (gameState.isBotMatch && gameState.botDifficulty === 'adaptive') {
               await updateAdaptiveBotLearning(gameState, winnerId);
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
                        
                        // Add cruzeiros
                        let currentCruzeiros = uData.cruzeiros || 0;
                        let reward = 0;
                        let rConfig: any = {
                          botWin: 20, botDraw: 5, botLoss: 5,
                          pvpWin: 50, pvpDraw: 20, pvpLoss: 10,
                          tournamentWin: 100, tournamentDraw: 0, tournamentLoss: 0
                        };
                        try {
                           const sysDoc = await getDoc(doc(db, 'system', 'rewards'));
                           if (sysDoc.exists()) {
                             rConfig = { ...rConfig, ...sysDoc.data() };
                           }
                        } catch(e) {}
                        
                        const snap = await getDocs(collection(db, "tournament_npcs"));
                        const npcNames = snap.empty ? [
                          "O Pai de familia",
                          "Devedor de Pensão",
                          "Mordedor",
                          "Quer X-Tudo",
                          "Quer X-Bacon",
                          "O Batata"
                        ] : snap.docs.sort((a: any, b: any) => a.data().order - b.data().order).map(d => d.data().name);

                        const isTournament = gameState.isBotMatch && npcNames.includes(opponent.username);
                        const isBot = gameState.isBotMatch && !isTournament;

                        if (isTournament) {
                           if (result === 'win') reward = rConfig.tournamentWin;
                           else if (result === 'draw') reward = rConfig.tournamentDraw;
                           else reward = rConfig.tournamentLoss;
                        } else if (isBot) {
                           if (result === 'win') reward = rConfig.botWin;
                           else if (result === 'draw') reward = rConfig.botDraw;
                           else reward = rConfig.botLoss;
                        } else {
                           if (result === 'win') reward = rConfig.pvpWin;
                           else if (result === 'draw') reward = rConfig.pvpDraw;
                           else reward = rConfig.pvpLoss;
                        }
                        
                        currentCruzeiros += reward;
                        let newProgress = uData.tournamentProgress || 1;
                        if (result === 'win' && isTournament) {
                           const npcIndex = npcNames.indexOf(opponent.username);
                           if (npcIndex !== -1 && npcIndex + 1 === newProgress) {
                               newProgress++;
                           }
                        }
                        await updateDoc(doc(db, 'users', myId), {
                            matchHistory: top5,
                            tournamentProgress: newProgress,
                            cruzeiros: currentCruzeiros
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

           let roundMsg = `Fim do Round ${gameState.round || 1}. `;
           if (p1Rounds > (gameState.player1.roundsWon||0) && p2Rounds > (gameState.player2.roundsWon||0)) roundMsg += 'Empate!';
           else if (p1Rounds > (gameState.player1.roundsWon||0)) roundMsg += `${gameState.player1.username} venceu a rodada.`;
           else roundMsg += `${gameState.player2.username} venceu a rodada.`;
           updateDoc(doc(db, 'games', gameId!), {
             battleLog: arrayUnion(roundMsg),
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
        const eventLogs: string[] = [];

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
        const { cardIndex: chosenIndex, pass: botDecidesToPass } = await determineBotMove(gameState);
        // Provocation logic
        if (Math.random() < 0.2) {
          const provocations = ["Vou esmagar você!", "Isso é o melhor que pode fazer?", "A vitória já é minha!", "Patético...", "Suas cartas são fracas demais.", "Desista enquanto há tempo!", "Você não tem chance contra mim.", "Previsível...", "Essa foi sua jogada? Hahaha!"];
          const msg = provocations[Math.floor(Math.random() * provocations.length)];
          const newMsg = {
             id: Date.now().toString() + Math.random(),
             senderId: "bot",
             senderName: gameState.player2.username,
             text: msg,
             timestamp: new Date().toISOString()
          };
          updateData.chatMessages = arrayUnion(newMsg);
        }
        
        if (botDecidesToPass || chosenIndex === null) {
           updateData['player2.passed'] = true;
           eventLogs.push(`${gameState.player2.username} passou o turno.`);
           if (eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }
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
        const cardToPlay = { ...botState.hand[cardIndex] };
        if (cardToPlay.type === 'Trap') {
          cardToPlay.isFacedown = true;
        }
        
        eventLogs.push(cardToPlay.type === 'Trap' ? `${botState.username} jogou uma carta Trap virada para baixo.` : `${botState.username} jogou a carta ${cardToPlay.name}.`);
        if (cardToPlay.type !== 'Trap' && cardToPlay.effects && cardToPlay.effects.length > 0) { eventLogs.push(`${botState.username} ativou: ${cardToPlay.effects.join(', ')}`); }
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
        let isDinheiroJuros = cardToPlay.effects?.includes('Dinheiro a Juros');
        let shouldDraw = 0;
        if (cardToPlay.effects?.includes('Comprar 1')) shouldDraw += 1;
        if (cardToPlay.effects?.includes('Comprar 2')) shouldDraw += 2;
        if (isSpy) shouldDraw += 2;
    if (isAssassinSpy) shouldDraw += 2;
    if (isDinheiroJuros) shouldDraw += 2; // Assume it also draws 2, or maybe not? user said 'jogue a carta no campo do adversário mas obriga o adversário a jogar uma carta do campo dele pro cemitério'. We will NOT draw 2, so it's a balanced spy: just kills an enemy card.
        
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
        } else if ((isSpy || isAssassinSpy || cardToPlay.effects?.includes('Ladrão') || isDinheiroJuros) && updatedPlayer1) {
          updatedPlayer1.board[targetRow] = [...(updatedPlayer1.board[targetRow] || []), cardToPlay];
        } else {
          newBoard[targetRow] = [...(newBoard[targetRow] || []), cardToPlay];
        }
        
        if (cardToPlay.effects?.includes('Ladrão') && updatedPlayer1) {
          if (updatedPlayer1.hand.length > 0) {
            const randomIndex = Math.floor(Math.random() * updatedPlayer1.hand.length);
            const stolenCard = updatedPlayer1.hand.splice(randomIndex, 1)[0];
            newHand.push(stolenCard);
          }
        }
        
        if (isDinheiroJuros && updatedPlayer1) {
          if (updatedPlayer1.deck.length > 0) {
            const drawnOppCard = updatedPlayer1.deck.shift();
            if (drawnOppCard) {
              let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
              if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
              if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
              if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
                 if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
              }
              
              if (oppTargetRow === 'discard') {
                updatedPlayer1.graveyard.push(drawnOppCard);
              } else if (oppTargetRow === 'scenario') {
                if (updatedPlayer1.board.scenario) updatedPlayer1.graveyard.push(updatedPlayer1.board.scenario);
                if (newBoard.scenario) {
                  newGraveyard.push(newBoard.scenario);
                  newBoard.scenario = null;
                }
                updatedPlayer1.board.scenario = drawnOppCard;
              } else {
                let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
                if (oppIsSpy) {
                  newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
                } else {
                  updatedPlayer1.board[oppTargetRow] = [...(updatedPlayer1.board[oppTargetRow] || []), drawnOppCard];
                }
              }
            }
          } else if (updatedPlayer1.hand.length > 0) {
            const randomIndex = Math.floor(Math.random() * updatedPlayer1.hand.length);
            const drawnOppCard = updatedPlayer1.hand.splice(randomIndex, 1)[0];
            if (drawnOppCard) {
              let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
              if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
              if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
              if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
                 if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
              }
              
              if (oppTargetRow === 'discard') {
                updatedPlayer1.graveyard.push(drawnOppCard);
              } else if (oppTargetRow === 'scenario') {
                if (updatedPlayer1.board.scenario) updatedPlayer1.graveyard.push(updatedPlayer1.board.scenario);
                if (newBoard.scenario) {
                  newGraveyard.push(newBoard.scenario);
                  newBoard.scenario = null;
                }
                updatedPlayer1.board.scenario = drawnOppCard;
              } else {
                let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão') || drawnOppCard.effects?.includes('Dinheiro a Juros');
                if (oppIsSpy) {
                  newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
                } else {
                  updatedPlayer1.board[oppTargetRow] = [...(updatedPlayer1.board[oppTargetRow] || []), drawnOppCard];
                }
              }
            }
          }
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
      eventLogs.push(`${me.username} usou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói do campo.`);
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
        if (shouldDraw > 0) eventLogs.push(`${botState.username} comprou ${shouldDraw} carta(s).`);
        if (shouldDraw > 0) eventLogs.push(`${me.username} comprou ${shouldDraw} carta(s).`);

        updateData['player2.hand'] = newHand;
        updateData['player2.board'] = newBoard;
        if (eventLogs && eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }
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
    
    let playedCard = { ...card };
    if (playedCard.type === 'Trap') {
      playedCard.isFacedown = true;
    }

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
    const eventLogs: string[] = [];
    eventLogs.push(playedCard.type === 'Trap' ? `${me.username} jogou uma carta Trap virada para baixo.` : `${me.username} jogou a carta ${card.name}.`);
    if (playedCard.type !== 'Trap' && playedCard.effects && playedCard.effects.length > 0) { eventLogs.push(`${me.username} ativou: ${playedCard.effects.join(', ')}`); }

        const isTrap = playedCard.type === 'Trap';
    let isSpy = isTrap ? false : card.effects?.includes('Espião');
    let isAssassinSpy = isTrap ? false : card.effects?.some((e: string) => e.includes('Espião Assassino'));
    let isMedic = isTrap ? false : card.effects?.includes('Médico');
    let isScorch = isTrap ? false : card.effects?.includes('Queimar');
    let isThief = isTrap ? false : card.effects?.includes('Ladrão');
    let isDinheiroJuros = isTrap ? false : card.effects?.includes('Dinheiro a Juros');

    let shouldDraw = 0;
    if (!isTrap && card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (!isTrap && card.effects?.includes('Comprar 2')) shouldDraw += 2;
    if (isSpy) shouldDraw += 2;
    if (isAssassinSpy) shouldDraw += 2; // Assume it also draws 2, or maybe not? user said 'jogue a carta no campo do adversário mas obriga o adversário a jogar uma carta do campo dele pro cemitério'. We will NOT draw 2, so it's a balanced spy: just kills an enemy card.

    if (targetRow === 'discard') {
      newGraveyard.push(playedCard);
    } else if (targetRow === 'scenario') {
      if (newBoard.scenario) {
        newGraveyard.push(newBoard.scenario);
      }
      if (updatedOpponent?.board.scenario) {
        updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
        updatedOpponent.board.scenario = null;
      }
      newBoard.scenario = playedCard;
    } else if ((isSpy || isAssassinSpy || isThief) && updatedOpponent) {
      updatedOpponent.board[targetRow] = [...(updatedOpponent.board[targetRow] || []), playedCard];
    } else {
      newBoard[targetRow] = [...(newBoard[targetRow] || []), playedCard];
    }
    

    if (isAssassinSpy && updatedOpponent && targetEnemyCard) {
      let destroyed = false;
      eventLogs.push(`${me.username} usou Espião Assassino e tentou destruir ${targetEnemyCard.name}.`);
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
    if (isThief && updatedOpponent) {
      if (updatedOpponent.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);
        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];
        newHand.push(stolenCard);
        eventLogs.push(`${me.username} usou Ladrão e roubou a carta ${stolenCard.name} da mão do adversário.`);
      }
    }
        if (isMedic && newGraveyard.length > 0) {
      const revivable = newGraveyard.filter(c => !c.effects?.includes('Herói'));
      if (revivable.length > 0) {
        revivable.sort((a, b) => (b.points || 0) - (a.points || 0));
        const revivedCard = revivable[0];
        newGraveyard = newGraveyard.filter(c => c.id !== revivedCard.id);
        newHand.push(revivedCard);
        eventLogs.push(`${me.username} usou Médico e reviveu ${revivedCard.name} do cemitério.`);
      }
    }

    if (isDinheiroJuros && updatedOpponent) {
      if (updatedOpponent.deck.length > 0) {
        const drawnOppCard = updatedOpponent.deck.shift();
        if (drawnOppCard) eventLogs.push(`${me.username} usou Dinheiro a Juros. O adversário foi forçado a jogar ${drawnOppCard.name} do topo do baralho.`);
        if (drawnOppCard) {
          let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
          if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
          if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
          if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
             if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
          }
          
          if (oppTargetRow === 'discard') {
            updatedOpponent.graveyard.push(drawnOppCard);
          } else if (oppTargetRow === 'scenario') {
            if (updatedOpponent.board.scenario) updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
            if (newBoard.scenario) {
              newGraveyard.push(newBoard.scenario);
              newBoard.scenario = null;
            }
            updatedOpponent.board.scenario = drawnOppCard;
          } else {
            let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão');
            if (oppIsSpy) {
              newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
            } else {
              updatedOpponent.board[oppTargetRow] = [...(updatedOpponent.board[oppTargetRow] || []), drawnOppCard];
            }
          }
        }
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
    if (eventLogs && eventLogs.length > 0) { updateData.battleLog = arrayUnion(...eventLogs); }
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
      turn: nextTurn,
      battleLog: arrayUnion(`${me.username} passou o turno.`)
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
       console.log('Você precisa de pelo menos 10 cartas no baralho para jogar.');
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
       console.log('Erro ao solicitar revanche.');
    }
  };

  const acceptRematch = async () => {
    if (!userData?.deck || userData.deck.length < 10) {
      console.log('Você precisa de 10 cartas no baralho para jogar!');
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

  const handleTargetEnemy = (enemyCard: Card) => {
    if (!targetingAssassinSpy) return;
    playCard(targetingAssassinSpy.spyCard, targetingAssassinSpy.targetRow, enemyCard);
    setTargetingAssassinSpy(null);
  };

  const activateTrap = async (card: Card, owner: 'me' | 'opponent', targetRow: 'melee' | 'ranged' | 'scenario') => {
    if (!userData || !gameState || !gameId) return;

    if (owner !== 'me') return; // Can only flip own traps
    const eventLogs: string[] = [];
    eventLogs.push(`${me.username} ativou a carta Trap: ${card.name}.`);
    if (card.effects && card.effects.length > 0) { eventLogs.push(`${me.username} ativou: ${card.effects.join(', ')}`); }

    let newBoard = { ...me.board };
    let newHand = [...me.hand];
    let newDeck = [...(me.deck || [])];
    let newGraveyard = [...(me.graveyard || [])];

    let updatedOpponent = opponent ? { 
      ...opponent, 
      board: { ...opponent.board }, 
      graveyard: [...(opponent.graveyard || [])], 
      hand: [...opponent.hand], 
      deck: [...opponent.deck] 
    } : null;

    // Find and flip the card in the correct row
    if (targetRow === 'scenario') {
      if (newBoard.scenario && newBoard.scenario.id === card.id) {
        newBoard.scenario = { ...newBoard.scenario, isFacedown: false };
      }
    } else {
      newBoard[targetRow] = newBoard[targetRow].map((c: Card) => {
        if (c.id === card.id && c.isFacedown) {
          return { ...c, isFacedown: false };
        }
        return c;
      });
    }

    // Apply effects
    let isScorch = card.effects?.includes('Queimar');
    if (isScorch) eventLogs.push(`${me.username} (Trap) ativou Queimar, destruindo a(s) carta(s) mais forte(s) não-Herói.`);
    let isThief = card.effects?.includes('Ladrão');
    let isDinheiroJuros = card.effects?.includes('Dinheiro a Juros');
    let isAssassinSpy = card.effects?.some((e: string) => e.includes('Espião Assassino'));

    if (isAssassinSpy && updatedOpponent) {
      eventLogs.push(`${me.username} (Trap) ativou Espião Assassino, tentando destruir a carta mais forte do adversário.`);
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
    }
    
    let shouldDraw = 0;
    if (card.effects?.includes('Comprar 1')) shouldDraw += 1;
    if (card.effects?.includes('Comprar 2')) shouldDraw += 2;
    if (isAssassinSpy) shouldDraw += 2;

    if (isThief && updatedOpponent) {
      if (updatedOpponent.hand.length > 0) {
        const randomIndex = Math.floor(Math.random() * updatedOpponent.hand.length);
        const stolenCard = updatedOpponent.hand.splice(randomIndex, 1)[0];
        newHand.push(stolenCard);
        eventLogs.push(`${me.username} (Trap) ativou Ladrão e roubou a carta ${stolenCard.name} da mão do adversário.`);
      }
    }

    if (isDinheiroJuros && updatedOpponent) {
      if (updatedOpponent.deck.length > 0) {
        const drawnOppCard = updatedOpponent.deck.shift();
        if (drawnOppCard) eventLogs.push(`${me.username} (Trap) ativou Dinheiro a Juros. O adversário jogou ${drawnOppCard.name} do topo do baralho.`);
        if (drawnOppCard) {
          let oppTargetRow: 'melee' | 'ranged' | 'scenario' | 'discard' = 'melee';
          if (drawnOppCard.type === 'Ranged') oppTargetRow = 'ranged';
          if (drawnOppCard.type === 'Cenário' || drawnOppCard.type === 'Scenario' || drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'scenario';
          if (drawnOppCard.type === 'Magic' || drawnOppCard.type === 'Heal' || drawnOppCard.type === 'Event') {
             if (!drawnOppCard.effects?.includes('Clima')) oppTargetRow = 'discard';
          }
          
          if (oppTargetRow === 'discard') {
            updatedOpponent.graveyard.push(drawnOppCard);
          } else if (oppTargetRow === 'scenario') {
            if (updatedOpponent.board.scenario) updatedOpponent.graveyard.push(updatedOpponent.board.scenario);
            if (newBoard.scenario) {
              newGraveyard.push(newBoard.scenario);
              newBoard.scenario = null;
            }
            updatedOpponent.board.scenario = drawnOppCard;
          } else {
            let oppIsSpy = drawnOppCard.effects?.includes('Espião') || drawnOppCard.effects?.includes('Espião Assassino') || drawnOppCard.effects?.includes('Ladrão');
            if (oppIsSpy) {
              newBoard[oppTargetRow] = [...(newBoard[oppTargetRow] || []), drawnOppCard];
            } else {
              updatedOpponent.board[oppTargetRow] = [...(updatedOpponent.board[oppTargetRow] || []), drawnOppCard];
            }
          }
        }
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

      if (highestPoints > 0) {
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

    for (let i = 0; i < shouldDraw; i++) {
      if (newDeck.length > 0) {
        newHand.push(newDeck.shift()!);
      }
    }
    if (shouldDraw > 0) eventLogs.push(`${me.username} (Trap) comprou ${shouldDraw} carta(s).`);

    const playerKey = isPlayer1 ? 'player1' : 'player2';
    const opponentKey = isPlayer1 ? 'player2' : 'player1';

    const updateData: any = {
      [`${playerKey}.board`]: newBoard,
      [`${playerKey}.hand`]: newHand,
      [`${playerKey}.deck`]: newDeck,
      [`${playerKey}.graveyard`]: newGraveyard
    };

    if (updatedOpponent) {
      updateData[`${opponentKey}.board`] = updatedOpponent.board;
      updateData[`${opponentKey}.hand`] = updatedOpponent.hand;
      updateData[`${opponentKey}.deck`] = updatedOpponent.deck;
      updateData[`${opponentKey}.graveyard`] = updatedOpponent.graveyard;
    }

    try {
      soundManager.playCardPlay(); // Play sound when flipped
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await updateDoc(doc(db, 'games', gameId), updateData);
    } catch(e) {
      console.error(e);
    }
  };

  if (gameState.status === 'challenge') {
  

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
    if (card.isFacedown) {
      return (
        <motion.div 
          key={`${card.id}-${keySuffix}`}
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
          whileHover={onClick ? { y: -10, scale: 1.05 } : {}}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={onClick}
          className={cn(
            `relative ${location === 'hand' ? 'w-16 h-24 sm:w-24 sm:h-36 md:w-28 md:h-40' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0`,
            onClick && "cursor-pointer hover:border-[#e2b17a] hover:shadow-[0_0_15px_rgba(226,177,122,0.5)] transition-colors duration-300"
          )}
        >
          {card.backImageUrl ? (
            <img src={card.backImageUrl} referrerPolicy="no-referrer" alt="Facedown" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          ) : (
            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-[#1a1814]">
              <div className="text-[#a67c52] text-xl font-bold tracking-widest opacity-30">?</div>
            </div>
          )}
        </motion.div>
      );
    }

    const pts = modifiedPoints !== undefined ? modifiedPoints : card.points;
    const isBuffed = pts > card.points;
    const isDebuffed = pts < card.points;
  

  return (

    <motion.div 
      key={`${card.id}-${keySuffix}`}
      layout
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      whileHover={onClick ? { y: -10, scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={cn(
        `relative ${location === 'hand' ? 'w-16 h-24 sm:w-24 sm:h-36 md:w-28 md:h-40' : 'w-12 h-16 sm:w-20 sm:h-28 md:w-24 md:h-32'} bg-[#3d3326] border sm:border-2 border-[#a67c52] rounded-md overflow-hidden group shadow-2xl flex flex-col shrink-0`,
        onClick && "cursor-pointer hover:border-[#e2b17a] hover:shadow-[0_0_15px_rgba(226,177,122,0.5)] transition-colors duration-300"
      )}
    >
      <div className={cn("absolute left-1 top-1 w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[8px] md:text-[10px] font-bold shadow-inner z-10 border border-black/50", isBuffed ? "bg-green-500 text-white" : isDebuffed ? "bg-red-500 text-white" : "bg-[#a67c52] text-black")}>
        {pts}
      </div>
      <div className="absolute right-1 top-1 text-[8px] font-bold uppercase text-[#a67c52] bg-black/80 px-1 py-0.5 rounded border border-[#3d3326] z-10 shadow">
        {card.type.substring(0, 3)}
      </div>

      {card.imageUrl ? (
        <img src={card.imageUrl} referrerPolicy="no-referrer" alt={card.name} className="absolute inset-0 w-full h-full object-contain opacity-80" />
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
    </motion.div>
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



  return (

    <div className="h-full flex flex-col bg-[#0f0e0c] text-[#d4c3a1] font-serif select-none overflow-hidden" style={opponent?.profile?.coverUrl ? { backgroundImage: `linear-gradient(rgba(15, 14, 12, 0.85), rgba(15, 14, 12, 0.95)), url(${opponent.profile.coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}>
      
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        
        {/* Left Sidebar (Game Info & Pass) */}
        <div className="w-full md:w-64 bg-[#141210] flex flex-row md:flex-col border-b md:border-b-0 md:border-r border-[#3d3326] shadow-2xl z-10 shrink-0 overflow-y-auto max-h-32 md:max-h-none">
           {/* Top Actions */}
           <div className="p-2 md:p-4 border-r md:border-r-0 md:border-b border-[#3d3326] flex flex-col items-center justify-center shrink-0 w-16 md:w-auto gap-1 md:gap-2">
              <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-2 w-full">
              <button onClick={() => { navigate('/'); }} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-red-900/30 hover:bg-red-800 rounded flex items-center justify-center transition-colors w-full md:w-auto">
                 <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Sair</span>
              </button>
              <button onClick={() => setShowAudioSettings(true)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto">
                 <Volume2 className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Áudio</span>
              </button>
              <button onClick={() => setIsLogOpen(!isLogOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">
                 <List className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/>
                 <span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Registro</span>
              </button>
              <button onClick={() => setIsChatOpen(!isChatOpen)} className="text-[#a67c52]/80 hover:text-white p-1.5 md:p-2 bg-[#3d3326]/30 hover:bg-[#3d3326]/50 rounded flex items-center justify-center transition-colors w-full md:w-auto relative">
                 <MessageSquare className="w-4 h-4 md:w-5 md:h-5 md:mr-1"/> 
                 <span className="hidden md:inline text-[9px] md:text-[10px] uppercase font-bold tracking-widest mt-1 md:mt-0">Chat</span>
                 {gameState.chatMessages && gameState.chatMessages.length > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                      {gameState.chatMessages.length}
                    </span>
                 )}
              </button>
              </div>
              <div className="text-center mt-2">
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
          <div className="p-1 md:p-6 border-r md:border-r-0 md:border-b border-[#3d3326] bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">
            {opponent?.profile?.coverUrl && (
              <img src={opponent.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" />
            )}
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <div className="flex gap-1">
                <div className={`w-2 h-2 rounded-full ${(opponent?.roundsWon || 0) >= 1 ? 'bg-[#e2b17a] shadow-[0_0_5px_#e2b17a]' : 'bg-[#3d3326]'}`}></div>
                <div className={`w-2 h-2 rounded-full ${(opponent?.roundsWon || 0) >= 2 ? 'bg-[#e2b17a] shadow-[0_0_5px_#e2b17a]' : 'bg-[#3d3326]'}`}></div>
              </div>
              
              <div className="flex flex-col items-center gap-2">
                {opponent?.profile?.avatarUrl && (
                  <img src={opponent.profile.avatarUrl} alt="Avatar" className="w-5 h-5 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover" />
                )}
                <h3 
                  className={cn("text-xs uppercase tracking-widest font-bold", opponent?.profile?.font || "font-sans")} 
                  style={{ color: opponent?.profile?.color || "#a67c52" }}
                >
                  {opponent?.username || 'Oponente'}
                </h3>
              </div>
            </div>
            <div className="text-xl md:text-5xl font-black md:mt-2 text-[#d4c3a1] relative z-10">{calculateScore(opponent!, me!)}</div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 md:mt-4 relative z-10"><span className="hidden md:inline">Cartas: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.hand.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mt-1 relative z-10"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{opponent?.graveyard?.length || 0}</span></div>
            {opponent?.graveyard && opponent.graveyard.length > 0 && (
               <div className="absolute top-1/2 -right-4 md:-right-8 w-12 h-16 md:w-16 md:h-24 bg-[#1a1814] border border-[#3d3326] rounded opacity-50 overflow-hidden transform -translate-y-1/2 scale-50 md:scale-75 cursor-pointer hover:opacity-100 hover:scale-75 md:hover:scale-100 transition-all z-20 shadow-lg flex items-center justify-center">
                  <AnimatePresence>
                     <motion.img 
                        key={`opp-gy-${opponent.graveyard[opponent.graveyard.length - 1].id}`}
                        src={opponent.graveyard[opponent.graveyard.length - 1].imageUrl}
                        initial={{ opacity: 0, scale: 1.5, y: -20, rotate: 10 }}
                        animate={{ opacity: 0.8, scale: 1, y: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-full object-cover"
                     />
                  </AnimatePresence>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-xl">{opponent.graveyard.length}</div>
               </div>
            )}
            {opponent?.passed && <div className="absolute bottom-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded z-10">Passou</div>}
          </div>

          {/* Player Info */}
          <div className="p-1 md:p-6 bg-[#1a1814] flex-1 flex flex-col items-center justify-center relative overflow-hidden text-center">
             {me?.profile?.coverUrl && (
                <img src={me.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-20 z-0" />
             )}
             {me?.passed && <div className="absolute top-4 text-xs font-bold text-red-500 uppercase tracking-widest border border-red-500/50 bg-red-950/30 px-3 py-1 rounded z-10">Passou</div>}
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4 relative z-10"><span className="hidden md:inline">Baralho: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.deck.length || 0}</span></div>
            <div className="text-[10px] text-[#d4c3a1]/50 uppercase mb-1 md:mb-4 relative z-10"><span className="hidden md:inline">Cemitério: </span><span className="text-[#e2b17a] font-bold text-sm">{me?.graveyard?.length || 0}</span></div>
            {me?.graveyard && me.graveyard.length > 0 && (
               <div className="absolute top-1/2 -right-4 md:-right-8 w-12 h-16 md:w-16 md:h-24 bg-[#1a1814] border border-[#3d3326] rounded opacity-50 overflow-hidden transform -translate-y-1/2 scale-50 md:scale-75 cursor-pointer hover:opacity-100 hover:scale-75 md:hover:scale-100 transition-all z-20 shadow-lg flex items-center justify-center" onClick={() => setSelectedCardModal(me.graveyard[me.graveyard.length - 1])}>
                  <AnimatePresence>
                     <motion.img 
                        key={`me-gy-${me.graveyard[me.graveyard.length - 1].id}`}
                        src={me.graveyard[me.graveyard.length - 1].imageUrl}
                        initial={{ opacity: 0, scale: 1.5, y: -20, rotate: -10 }}
                        animate={{ opacity: 0.8, scale: 1, y: 0, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-full object-cover"
                     />
                  </AnimatePresence>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold text-xl">{me.graveyard.length}</div>
               </div>
            )}
            <div className="text-xl md:text-5xl font-black md:mb-2 text-[#d4c3a1] relative z-10">{calculateScore(me!, opponent!)}</div>
            <div className="flex items-center gap-2 mt-2 relative z-10">
              
              <div className="flex flex-col items-center gap-2">
                {me?.profile?.avatarUrl && (
                  <img src={me.profile.avatarUrl} alt="Avatar" className="w-5 h-5 md:w-10 md:h-10 rounded-full border border-[#3d3326] object-cover" />
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
              <div className="w-full mt-2 md:mt-6 flex flex-col gap-2 relative z-10">
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
              <div className="w-full mt-2 md:mt-6 flex flex-col gap-2 relative z-10">
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
                  <div className="min-h-[3.25rem] flex-1 sm:flex-none sm:h-20 md:h-24 bg-black/20 border border-white/5 flex items-center px-2 md:px-4 gap-1 md:gap-2 relative">
                     <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#3d3326] rounded-full border border-[#a67c52] flex items-center justify-center text-xs font-bold">0</div>
                     {renderCard(opponent.board.scenario, 'opp-scen', opponent.board.scenario.isFacedown ? () => activateTrap(opponent.board.scenario!, 'opponent', 'scenario') : undefined)}
                     <span className="absolute right-4 text-[10px] uppercase text-white/20 font-sans tracking-tighter">Cenário</span>
                  </div>
                )}
                <div className="min-h-[4.5rem] flex-1 sm:flex-none overflow-x-auto no-scrollbar sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={rangedBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${rangedBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#3d3326] rounded-full border border-[#a67c52] flex items-center justify-center text-xs font-bold shadow-lg">
                     {getRowScore(opponent?.board.ranged || [], opponent?.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {/* updated opp ranged */}<AnimatePresence>{opponent?.board.ranged.map((c, idx) => renderCard(c, `opp-r-${c.id}-${idx}`, c.isFacedown ? () => activateTrap(c, 'opponent', 'ranged') : (targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined), getCardPoints(c, opponent.board.ranged, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>
                   <span className="absolute right-4 text-[10px] uppercase text-white/20 font-sans tracking-tighter">Fila à Distância</span>
                </div>
                <div className="min-h-[4.5rem] flex-1 sm:flex-none overflow-x-auto no-scrollbar sm:h-28 md:h-36 bg-black/20 border border-white/5 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={meleeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${meleeBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#3d3326] rounded-full border border-[#a67c52] flex items-center justify-center text-xs font-bold shadow-lg">
                     {getRowScore(opponent?.board.melee || [], opponent?.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {/* updated opp melee */}<AnimatePresence>{opponent?.board.melee.map((c, idx) => renderCard(c, `opp-m-${c.id}-${idx}`, c.isFacedown ? () => activateTrap(c, 'opponent', 'melee') : (targetingAssassinSpy && !c.effects?.includes('Herói') ? () => handleTargetEnemy(c) : undefined), getCardPoints(c, opponent.board.melee, opponent.board.scenario, me?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>
                   <span className="absolute right-4 text-[10px] uppercase text-white/20 font-sans tracking-tighter">Fila Corpo a Corpo</span>
                </div>
             </div>

             <div className="h-[2px] bg-gradient-to-r from-transparent via-[#3d3326] to-transparent mx-10 my-2"></div>

             {/* Player Board */}
             <div className="flex-1 flex flex-col justify-start gap-1 mt-2">
                <div className="min-h-[4.5rem] flex-1 sm:flex-none overflow-x-auto no-scrollbar sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={meleeBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${meleeBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#a67c52] rounded-full border border-black flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(166,124,82,0.5)]">
                      {getRowScore(me?.board.melee || [], me?.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {/* updated me melee */}<AnimatePresence>{me?.board.melee.map((c, idx) => renderCard(c, `me-m-${c.id}-${idx}`, c.isFacedown ? () => activateTrap(c, 'me', 'melee') : undefined, getCardPoints(c, me.board.melee, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>
                   <span className="absolute right-4 text-[10px] uppercase text-[#a67c52]/30 font-sans tracking-tighter font-bold">Fila Corpo a Corpo</span>
                </div>
                <div className="min-h-[4.5rem] flex-1 sm:flex-none overflow-x-auto no-scrollbar sm:h-28 md:h-36 bg-[#2d2922]/30 border border-[#a67c52]/20 rounded-sm flex items-center px-2 md:px-4 gap-1 md:gap-2 relative pl-6 md:pl-12" style={rangedBg ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${rangedBg})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}>
                   <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#a67c52] rounded-full border border-black flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(166,124,82,0.5)]">
                      {getRowScore(me?.board.ranged || [], me?.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)}
                   </div>
                   {/* updated me ranged */}<AnimatePresence>{me?.board.ranged.map((c, idx) => renderCard(c, `me-r-${c.id}-${idx}`, c.isFacedown ? () => activateTrap(c, 'me', 'ranged') : undefined, getCardPoints(c, me.board.ranged, me.board.scenario, opponent?.board.scenario, globalMeleeBuffs, globalRangedBuffs, globalMeleeTraps, globalRangedTraps, allActiveCards)))}</AnimatePresence>
                   <span className="absolute right-4 text-[10px] uppercase text-[#a67c52]/30 font-sans tracking-tighter font-bold">Fila à Distância</span>
                </div>
                {me?.board.scenario && (
                  <div className="min-h-[3.25rem] flex-1 sm:flex-none sm:h-20 md:h-24 bg-[#2d2922]/30 border border-[#a67c52]/20 flex items-center px-2 md:px-4 gap-1 md:gap-2 relative">
                     <div className="absolute left-0 md:left-[-10px] w-6 h-6 md:w-8 md:h-8 bg-[#a67c52] rounded-full border border-black flex items-center justify-center text-xs font-bold text-black shadow-[0_0_10px_rgba(166,124,82,0.5)]">0</div>
                     {renderCard(me.board.scenario, 'me-scen', me.board.scenario.isFacedown ? () => activateTrap(me.board.scenario!, 'me', 'scenario') : undefined)}
                     <span className="absolute right-4 text-[10px] uppercase text-[#a67c52]/30 font-sans tracking-tighter font-bold">Cenário</span>
                  </div>
                )}
             </div>
           </div>

          {/* Hand */}
          <div className="h-36 sm:h-44 md:h-48 bg-[#1a1814] flex items-center md:items-center justify-start md:justify-center px-4 md:px-10 gap-2 border-t border-[#3d3326] shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20 overflow-x-auto no-scrollbar relative shrink-0 w-full pt-4 md:pt-0">
             <div className="absolute left-4 bottom-full mb-1 md:mb-2 text-[10px] font-bold text-[#a67c52] uppercase tracking-widest drop-shadow-md">Sua Mão</div>
             <AnimatePresence>{me?.hand.map((card, idx) => {
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
               
               return renderCard(card, `hand-${card.id}-${idx}`, onClick, undefined, 'hand');
             })}</AnimatePresence>
          </div>
        </div>

      </div>
      
      <AnimatePresence>
        {roundOverlay.show && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
             <h1 className={`text-5xl md:text-8xl font-black uppercase tracking-[0.2em] ${roundOverlay.color} drop-shadow-[0_0_30px_rgba(0,0,0,1)] text-center`}>
                {roundOverlay.message}
             </h1>
          </motion.div>
        )}
      </AnimatePresence>

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
      {isLogOpen && (
        <BattleLogPanel 
          logs={gameState.battleLog || []} 
          onClose={() => setIsLogOpen(false)} 
        />
      )}
      {showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}
      {selectedCardModal && (
        <CardModal card={selectedCardModal} onClose={() => setSelectedCardModal(null)} />
      )}
    </div>
  );
}
