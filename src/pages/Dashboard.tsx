import React from "react";
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { logActivity } from '../lib/activity';
import { loadAllCards, getCachedCard, getAllCachedCards } from '../lib/cardsCache';
import { doc, getDoc, updateDoc, collection, addDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { Card, GameState } from '../types';
import { useNavigate, Link } from 'react-router-dom';
import { Store as StoreIcon, ShieldAlert, Plus, Play, LogOut, Edit2, Check, User as UserIcon, Users, Eye, Trophy, Volume2 } from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';
import { HistoryModal } from '../components/HistoryModal';
import { FriendsModal } from '../components/FriendsModal';
import { TradeModal } from '../components/TradeModal';
import { CardModal } from '../components/CardModal';
import { AudioSettingsModal } from '../components/AudioSettingsModal';
import { useAudio } from '../contexts/AudioContext';
import { TournamentTab } from '../components/TournamentTab';
import { DeckModal } from '../components/DeckModal';
import { HowToPlayModal } from '../components/HowToPlayModal';

export default function Dashboard() {
  const { userData } = useAuth();
  const { setCurrentPlaylist, config } = useAudio();

  useEffect(() => {
    if (config.menuMusic && config.menuMusic.length > 0) {
      setCurrentPlaylist(config.menuMusic);
    } else {
      setCurrentPlaylist(null);
    }
  }, [config.menuMusic, setCurrentPlaylist]);
  const [inventoryCards, setInventoryCards] = useState<Card[]>([]);
  const [deckIds, setDeckIds] = useState<string[]>([]);
  const [cardCodeInput, setCardCodeInput] = useState('');
  const [cardQuantityInput, setCardQuantityInput] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [activeTradeId, setActiveTradeId] = useState<string | null>(null);
  const [incomingChallenge, setIncomingChallenge] = useState<GameState | null>(null);
  const [selectedCardModal, setSelectedCardModal] = useState<Card | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [botDifficulty, setBotDifficulty] = useState<'easy' | 'normal' | 'hard' | 'expert' | 'adaptive'>('easy');
  const [showOnlyDeck, setShowOnlyDeck] = useState(false);
  const [deckNameInput, setDeckNameInput] = useState('');

  const [roomName, setRoomName] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomError, setRoomError] = useState('');
  const [roomMode, setRoomMode] = useState<'create' | 'join'>('create');
  const [mainTab, setMainTab] = useState<'geral' | 'torneio'>('geral');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      setDeckIds(userData.deck || []);
      
      // Prevent redundant fetches
      const currentInv = userData.inventory || [];
      const currentInvStr = currentInv.join(',');
      
      fetchInventory(currentInv);
      
      setNewUsername(userData.username || '');
      
      const tradesQ = query(
        collection(db, 'trades'),
        where('status', '==', 'pending'),
        where('participants', 'array-contains', userData.uid)
      );
      const challengesQ = query(
        collection(db, 'games'),
        where('status', '==', 'challenge'),
        where('player2.uid', '==', userData.uid)
      );
      const unsubChallenges = onSnapshot(challengesQ, (snap) => {
         const challenges = snap.docs
            .map(d => ({ id: d.id, ...d.data() } as GameState))
            .filter(g => g.player2?.uid === userData.uid);
         if (challenges.length > 0) {
            setIncomingChallenge(challenges[0]);
         } else {
            setIncomingChallenge(null);
         }
      }, (err) => console.error('Error in challenges listener:', err));

      const unsubTrades = onSnapshot(tradesQ, (snap) => {
         const pendingTrades = snap.docs.filter(d => d.data().participants?.includes(userData?.uid));
         if (pendingTrades.length > 0) {
            const tradeDoc = pendingTrades[0];
            if (!activeTradeId) {
               setActiveTradeId(tradeDoc.id);
               setShowFriendsModal(false);
            }
         } else {
            setActiveTradeId(null);
         }
      }, (err) => console.error('Error in trades listener:', err));
      return () => { unsubTrades(); unsubChallenges(); };
    }
  }, [userData]);

  const acceptChallenge = async (gameId: string) => {
    if (deckIds.length !== 10) {
      console.log('Você precisa de exatamente 10 cartas no baralho para jogar!');
      return;
    }
    try {
      await loadAllCards();
      const p2Deck = deckIds.map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
      
      
      await updateDoc(doc(db, 'games', gameId), {
        'player2.deck': p2Deck,
        status: 'playing'
      });
      navigate('/game/' + gameId);
    } catch(e) { console.error(e); }
  };

  const declineChallenge = async (gameId: string) => {
    try {
      await updateDoc(doc(db, 'games', gameId), {
         status: 'declined'
      });
      setIncomingChallenge(null);
    } catch(e) { console.error(e); }
  };

  const handleUpdateUsername = async () => {
    if (newUsername.trim() && userData) {
      await updateDoc(doc(db, 'users', userData.uid), { username: newUsername.trim() });
      setIsEditingUsername(false);
    }
  };

  const fetchInventory = async (inventoryIds: string[]) => {
    try {
      await loadAllCards();
      
      const hasAllCards = userData?.role === 'admin' || userData?.hasAllCards;
      
      if (hasAllCards) {
         const allCards = getAllCachedCards();
         const cards: Card[] = [];
         allCards.forEach(c => {
             cards.push(c, c, c); // 3 copies of each card for deck building
         });
         setInventoryCards(cards);
      } else {
        if (inventoryIds.length === 0) {
          setInventoryCards([]);
          return;
        }
        const cards: Card[] = [];
        for (const id of inventoryIds) {
          const card = getCachedCard(id);
          if (card) cards.push(card);
        }
        setInventoryCards(cards);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!cardCodeInput.trim()) return;
    if (cardQuantityInput < 1) {
      setError('A quantidade deve ser pelo menos 1.');
      return;
    }

    try {
      await loadAllCards(true); // Force reload to ensure new cards are fetched
      const cardCode = cardCodeInput.trim();
      const cachedCard = getCachedCard(cardCode);
      
      if (cachedCard) {
        const newInventory = [...(userData?.inventory || [])];
        for (let i = 0; i < cardQuantityInput; i++) {
          newInventory.push(cardCode);
        }
        await updateDoc(doc(db, 'users', userData!.uid), {
          inventory: newInventory
        });
        setMessage(`Adicionado com sucesso: ${cachedCard.name} (${cardQuantityInput}x)`);
        await logActivity(userData!.uid, userData!.username, 'redeem_code', `Resgatou o código da carta ${cachedCard.name} (${cardQuantityInput}x)`);
        setCardCodeInput('');
        setCardQuantityInput(1);
      } else {
        setError('Código de carta inválido.');
      }
    } catch (err: any) {
      setError('Erro ao adicionar carta.');
    }
  };

  const handleDeckCard = async (cardId: string, action: 'add' | 'remove') => {
    let newDeck = [...deckIds];
    if (action === 'add') {
      if (newDeck.length >= 10) {
         console.log('Seu baralho já possui o máximo de 10 cartas! Remova alguma antes de adicionar outra.');
         return;
      }
      newDeck.push(cardId);
    } else {
      const idx = newDeck.indexOf(cardId);
      if (idx > -1) newDeck.splice(idx, 1);
    }
    setDeckIds(newDeck);
    if (userData) {
      const activeId = userData.activeDeckId || 'default';
      const currentDecks = userData.savedDecks || [{ id: 'default', name: 'Baralho Padrão', cards: userData.deck || [] }];
      const updatedDecks = currentDecks.map(d => d.id === activeId ? { ...d, cards: newDeck } : d);
      
      await updateDoc(doc(db, 'users', userData.uid), { 
        deck: newDeck, 
        savedDecks: updatedDecks 
      });
    }
  };

  const startTutorialMatch = async () => {
    if (deckIds.length < 10) {
      setError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }
    setSearching(true);
    
    try {
      await loadAllCards();
      const p1Deck = deckIds.map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
      
      

      
      const allCards = getAllCachedCards();
      const botDeck = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 10);

      const gamesRef = collection(db, 'games');
      const newGameData = {
        player1: {
          uid: userData?.uid,
          username: userData?.username,
          profile: userData?.profile || null,
          deck: p1Deck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        player2: {
          uid: 'bot',
          username: 'Mestre Tutorial',
          deck: botDeck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        status: 'playing',
        turn: userData?.uid,
        round: 1,
        winner: null,
        isBotMatch: true,
        botDifficulty: botDifficulty,
        isTutorial: true,
        tutorialStep: 0
      };
      
      const newGameRef = await addDoc(gamesRef, newGameData);
      navigate('/game/' + newGameRef.id);
    } catch(err) {
      console.error(err);
      setError('Ocorreu um erro ao iniciar o tutorial.');
      setSearching(false);
    }
  };

  const startBotMatch = async () => {
    if (deckIds.length < 10) {
      setError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }
    setSearching(true);
    
    try {
      await loadAllCards();
      const p1Deck = deckIds.map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
      
      

      
      const allCards = getAllCachedCards();
      let botDeck: Card[] = [];
      
      if (botDifficulty === 'adaptive') {
         // Try to load weights
         let cardWeights: Record<string, number> = {};
         try {
           const snap = await getDoc(doc(db, 'ai_data', 'learning'));
           if (snap.exists()) {
              cardWeights = snap.data().cardWeights || {};
           }
         } catch(e) {}
         
         const sortedCards = [...allCards].sort((a, b) => {
            const wa = cardWeights[a.name] || 0;
            const wb = cardWeights[b.name] || 0;
            // Also value base points
            return (wb + (b.points || 0) * 0.5) - (wa + (a.points || 0) * 0.5);
         });
         
         // Top 7 learned cards + 3 random for variety
         const bestCards = sortedCards.slice(0, 15).sort(() => 0.5 - Math.random()).slice(0, 7);
         const otherCards = sortedCards.slice(15).sort(() => 0.5 - Math.random()).slice(0, 3);
         botDeck = [...bestCards, ...otherCards].sort(() => 0.5 - Math.random());
      } else {
         botDeck = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 10) as Card[];
      }

      const gamesRef = collection(db, 'games');
      const newGameData = {
        player1: {
          uid: userData?.uid,
          username: userData?.username,
          profile: userData?.profile || null,
          deck: p1Deck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        player2: {
          uid: 'bot',
          username: 'Bot',
          deck: botDeck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        status: 'playing',
        turn: userData?.uid,
        round: 1,
        winner: null,
        isBotMatch: true,
        botDifficulty: botDifficulty
      };
      
      const newGameRef = await addDoc(gamesRef, newGameData);
      navigate('/game/' + newGameRef.id);
    } catch(err) {
      console.error(err);
      setError('Ocorreu um erro ao iniciar a partida com o bot.');
      setSearching(false);
    }
  };

  
  const startSpecificBotMatch = async (diff: string, customDeck: Card[], botName: string, botProfile?: any, campaignId?: string) => {
    if (deckIds.length < 10) {
      setError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }
    setSearching(true);
    
    try {
      await loadAllCards();
      const p1Deck = deckIds.map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
      
      

      const gamesRef = collection(db, 'games');
      const newGameData = {
        player1: {
          uid: userData?.uid,
          username: userData?.username,
          profile: userData?.profile || null,
          deck: p1Deck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        player2: {
          uid: 'bot',
          username: botName,
          profile: botProfile || null,
          deck: customDeck,
          hand: [],
          graveyard: [],
          board: { melee: [], ranged: [], scenario: null },
          score: 0,
          passed: false,
          roundsWon: 0,
          initialDraw: false
        },
        status: 'playing',
        turn: userData?.uid,
        round: 1,
        winner: null,
        isBotMatch: true,        
        botDifficulty: diff,
        campaignId: campaignId || null
      };
      
      const newGameRef = await addDoc(gamesRef, newGameData);
      navigate('/game/' + newGameRef.id);
    } catch(err) {
      console.error(err);
      setError('Ocorreu um erro ao iniciar a partida com o bot.');
      setSearching(false);
    }
  };

  const findMatch = async () => {
    if (deckIds.length < 10) {
      setError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }
    
    setSearching(true);
    
    const gamesRef = collection(db, 'games');
    const p1GamesQ = query(gamesRef, where('status', 'in', ['waiting', 'playing']));
    
    
    try {
      const activeGamesSnap = await getDocs(p1GamesQ);
      const allDocs = activeGamesSnap.docs;
      let existingMyGame = null;
      let availableGame = null;

      allDocs.forEach(doc => {
        const game = doc.data() as GameState;
        if (game.status === 'playing' || game.status === 'waiting') {
           if (game.player1.uid === userData?.uid || game.player2?.uid === userData?.uid) {
             existingMyGame = doc;
           }
        }
        if (game.status === 'waiting' && game.player1.uid !== userData?.uid && !game.isPrivate) {
           availableGame = doc;
        }
      });

      if (existingMyGame) {
         navigate(`/game/${existingMyGame.id}`);
         return;
      }

      if (availableGame) {
        const gameDoc = availableGame;
        const game = gameDoc.data() as GameState;
        
        await loadAllCards();
        const p2Deck: Card[] = deckIds.map(id => getCachedCard(id)).filter(Boolean) as Card[];

        await updateDoc(doc(db, 'games', gameDoc.id), {
          player2: {
            uid: userData?.uid,
            username: userData?.username,
          profile: userData?.profile || null,
            deck: p2Deck,
            hand: [],
            graveyard: [],
            board: { melee: [], ranged: [], scenario: null },
            score: 0,
            passed: false,
            roundsWon: 0, initialDraw: false
          },
          status: 'playing'
        });
        navigate(`/game/${gameDoc.id}`);
      } else {
        await loadAllCards();
        const p1Deck: Card[] = deckIds.map(id => getCachedCard(id)).filter(Boolean) as Card[];

        const newGameData: Partial<GameState> = {
          player1: {
            uid: userData!.uid,
            username: userData!.username,
            profile: userData!.profile || null,
            deck: p1Deck,
            hand: [],
            graveyard: [],
            board: { melee: [], ranged: [], scenario: null },
            score: 0,
            passed: false,
            roundsWon: 0, initialDraw: false
          },
          player2: null,
          status: 'waiting',
          turn: userData!.uid,
          round: 1,
          winner: null
        };
        const newGameRef = await addDoc(collection(db, 'games'), newGameData);
        navigate(`/game/${newGameRef.id}`);
      }
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao procurar partida.');
      setSearching(false);
    }
  };

  const handlePrivateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoomError('');
    if (!roomName.trim()) {
      setRoomError('Nome da sala é obrigatório.');
      return;
    }
    
    if (deckIds.length < 10) {
      setRoomError('Você precisa de pelo menos 10 cartas no seu baralho para jogar.');
      return;
    }

    setSearching(true);
    
    try {
      await loadAllCards();
      const pDeck: Card[] = deckIds.map(id => getCachedCard(id)).filter(Boolean) as Card[];

      const gamesRef = collection(db, 'games');
      
      if (roomMode === 'join') {
        const joinQ = query(gamesRef, where('roomName', '==', roomName.trim()));
        const snapshot = await getDocs(joinQ);
        const gameDoc = snapshot.docs.find(d => d.data().isPrivate === true && d.data().status === 'waiting');
        if (!gameDoc) {
          setRoomError('Sala não encontrada ou já iniciada.');
          setSearching(false);
          return;
        }
        
        // const gameDoc = snapshot.docs[0];
        const gameData = gameDoc.data() as GameState;
        
        if (gameData.roomPassword && gameData.roomPassword !== roomPassword) {
          setRoomError('Senha incorreta.');
          setSearching(false);
          return;
        }
        
        await updateDoc(doc(db, 'games', gameDoc.id), {
          player2: {
            uid: userData?.uid,
            username: userData?.username,
            profile: userData?.profile || null,
            deck: pDeck,
            hand: [],
            graveyard: [],
            board: { melee: [], ranged: [], scenario: null },
            score: 0,
            passed: false,
            roundsWon: 0, initialDraw: false
          },
          status: 'playing'
        });
        navigate(`/game/${gameDoc.id}`);
      } else {
        // Create Room
        const newGameData: Partial<GameState> = {
          player1: {
            uid: userData!.uid,
            username: userData!.username,
            profile: userData!.profile || null,
            deck: pDeck,
            hand: [],
            graveyard: [],
            board: { melee: [], ranged: [], scenario: null },
            score: 0,
            passed: false,
            roundsWon: 0, initialDraw: false
          },
          player2: null,
          status: 'waiting',
          turn: userData!.uid,
          round: 1,
          winner: null,
          isPrivate: true,
          roomName: roomName.trim(),
          roomPassword: roomPassword
        };
        const newGameRef = await addDoc(gamesRef, newGameData);
        navigate(`/game/${newGameRef.id}`);
      }
    } catch (err) {
      console.error(err);
      setRoomError('Ocorreu um erro ao conectar à sala.');
      setSearching(false);
    }
  };

  const handleLogout = () => {
    auth.signOut();
  };

  const inventoryGrouped = Object.values(inventoryCards.reduce((acc, card) => {
    if (!acc[card.id]) {
      acc[card.id] = { card, count: 0 };
    }
    acc[card.id].count++;
    return acc;
  }, {} as Record<string, { card: Card; count: number }>));

  const deckCounts = deckIds.reduce((acc, id) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8 font-sans h-full overflow-y-auto overflow-x-hidden w-full">
      {showProfileModal && userData && (
        <ProfileModal userData={userData} onClose={() => setShowProfileModal(false)} />
      )}
      {showFriendsModal && userData && (
        <FriendsModal userData={userData} onClose={() => setShowFriendsModal(false)} onTrade={(tId) => setActiveTradeId(tId)} onChallenge={(gId) => navigate('/game/' + gId)} />
      )}
      {activeTradeId && userData && (
        <TradeModal tradeId={activeTradeId} userData={userData} onClose={() => setActiveTradeId(null)} />
      )}
      {showAudioSettings && <AudioSettingsModal onClose={() => setShowAudioSettings(false)} />}
      {selectedCardModal && (
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
    
      )}
      {showDeckModal && userData && (
        <DeckModal deckIds={deckIds} onClose={() => setShowDeckModal(false)} />
      )}
      {showHowToPlayModal && (
        <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />
      )}
      {showHistoryModal && userData && (
        <HistoryModal userData={userData} onClose={() => setShowHistoryModal(false)} />
      )}
      {/* Header */}
      <div className="flex justify-between items-center bg-[#1a1814] border border-[#3d3326] p-4 rounded shadow-2xl flex-wrap gap-4 relative overflow-hidden">
        {userData?.profile?.coverUrl && (
           <img src={userData.profile.coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-30 z-0" />
        )}
        <div className="relative z-10 flex items-center gap-4">
          {userData?.profile?.avatarUrl && (
             <img src={userData.profile.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border border-[#a67c52] object-cover shadow" />
          )}
          <div>
            <div className="flex items-center gap-2">
              {isEditingUsername ? (
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={newUsername} 
                  onChange={(e) => setNewUsername(e.target.value)} 
                  className="bg-black/50 border border-[#3d3326] rounded px-2 py-1 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                  placeholder="Novo nome"
                />
                <button onClick={handleUpdateUsername} className="p-1 bg-[#a67c52]/20 text-[#a67c52] rounded hover:bg-[#a67c52]/40 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
              </div>
    
            ) : (
              <h1 
                className={`text-2xl font-bold tracking-tighter uppercase ${userData?.profile?.font || ''}`}
                style={{ color: userData?.profile?.color || '#a67c52', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
              >
                Bem-vindo, {userData?.username}
              </h1>
            )}
            {!isEditingUsername && (
              <button onClick={() => setIsEditingUsername(true)} className="text-[#d4c3a1]/40 hover:text-[#a67c52] transition-colors p-1">
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
    
          <p className="text-[#d4c3a1]/60 text-[10px] tracking-widest uppercase">Prepare seu baralho para a batalha.</p>
          <div className="flex gap-2 text-[10px] uppercase font-bold tracking-widest mt-1">
             <span className="text-[#d4c3a1]/60">Nível: <span className="text-[#e2b17a]">{userData?.tournamentProgress || 1}</span></span>
             <span className="text-[#d4c3a1]/60">Cruzeiros: <span className="text-yellow-500">{userData?.cruzeiros || 0} C$</span></span>
          </div>
    
          </div>
    
        </div>
    
        <div className="flex flex-wrap justify-center gap-2 md:gap-4 relative z-10 w-full md:w-auto">
          {userData?.role === 'admin' && (
            <Link to="/admin" className="flex items-center gap-2 bg-[#a67c52]/10 border border-[#a67c52]/30 text-[#a67c52] px-4 py-2 rounded text-xs font-bold uppercase hover:bg-[#a67c52]/20 transition-colors">
              <ShieldAlert className="w-4 h-4" /> Painel Admin
            </Link>
          )}
          <Link to="/store" className="flex items-center gap-2 bg-gradient-to-r from-yellow-700 to-yellow-600 border border-yellow-500/30 text-black px-4 py-2 rounded text-xs font-bold uppercase hover:from-yellow-600 hover:to-yellow-500 transition-colors shadow-[0_0_10px_rgba(202,138,4,0.3)]">
             <StoreIcon className="w-4 h-4" /> Loja
          </Link>
          <button onClick={() => setShowFriendsModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors relative">
            <Users className="w-4 h-4" /> Amigos
            {userData?.friendRequests && userData.friendRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {userData.friendRequests.length}
              </span>
            )}
          </button>
          <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <Trophy className="w-4 h-4" /> Histórico
          </button>
          <button onClick={() => setShowAudioSettings(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <Volume2 className="w-4 h-4" /> Áudio
          </button>
          <button onClick={() => setShowProfileModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] hover:text-[#141210] rounded uppercase font-bold text-xs transition-colors">
            <UserIcon className="w-4 h-4" /> Perfil
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-950/50 hover:bg-red-900/50 text-red-500 rounded uppercase font-bold text-xs transition-colors">
             <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
    
      </div>
    

            <div className="flex gap-2 mb-4 w-full justify-center">
           <button 
              onClick={() => setMainTab('geral')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'geral' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              Geral
           </button>
           <button 
              onClick={() => setMainTab('torneio')}
              className={`px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-colors border ${mainTab === 'torneio' ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#d4c3a1]/60 border-[#3d3326] hover:text-[#d4c3a1]'}`}
           >
              1º Torneio
           </button>
      </div>
    
      
      {mainTab === 'torneio' && userData && (
         <TournamentTab userData={userData} startSpecificBotMatch={startSpecificBotMatch} searching={searching} />
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${mainTab === 'geral' ? '' : 'hidden'}`}>
        
        {/* Left Column: Actions */}
        <div className="space-y-8 lg:col-span-1">
          
          {/* Matchmaking */}
          <div className="bg-[#1a1814] border border-[#3d3326] p-6 rounded shadow-2xl text-center">
            <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-1">Procurar Partida</h2>
            <p className="text-[#d4c3a1]/60 text-[10px] tracking-widest uppercase mb-6">Jogue contra outro jogador online.</p>
            <button 
              onClick={findMatch}
              disabled={searching}
              className="w-full bg-gradient-to-r from-[#a67c52] to-[#805e3b] hover:from-[#e2b17a] hover:to-[#a67c52] disabled:opacity-50 text-black py-3 rounded border border-[#e2b17a] font-bold uppercase text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              {searching ? 'Procurando...' : 'Jogar Agora'}
            </button>
            <div className="mt-3 flex gap-2 w-full">
              <select 
                value={botDifficulty} 
                onChange={(e) => setBotDifficulty(e.target.value as any)}
                className="bg-black/50 border border-[#3d3326] rounded px-2 py-1 text-xs text-[#e2b17a] font-bold focus:outline-none focus:border-[#a67c52] uppercase flex-1"
              >
                <option value="easy">Bot: Fácil</option>
                <option value="normal">Bot: Normal</option>
                <option value="hard">Bot: Difícil</option>
                <option value="expert">Bot: Impossível</option>
                <option value="adaptive">MODO IA (Aprende)</option>
              </select>
              <button 
                onClick={startBotMatch}
                disabled={searching}
                className="flex-1 bg-[#3d3326] hover:bg-[#a67c52]/50 disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2"
              >
                Jogar Bot
              </button>
            </div>
    
            <button 
              onClick={startTutorialMatch}
              disabled={searching}
              className="w-full mt-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2 border border-blue-500/50"
            >
              Jogar Tutorial Interativo
            </button>
            <button 
              onClick={() => setShowHowToPlayModal(true)}
              disabled={searching}
              className="w-full mt-2 bg-black hover:bg-[#3d3326] disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2 border border-[#3d3326]"
            >
              Como Jogar (Regras)
            </button>
            {deckIds.length < 10 && (
               <p className="text-red-500 text-xs mt-2 uppercase font-bold text-[10px]">O baralho requer 10 cartas. ({deckIds.length}/10)</p>
            )}
          </div>
    

          {/* Private Room */}
          <div className="bg-[#1a1814] border border-[#3d3326] p-6 rounded shadow-2xl">
            <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-4 text-center">Sala Privada</h2>
            <div className="flex gap-2 mb-4">
               <button 
                 onClick={() => setRoomMode('create')}
                 className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${roomMode === 'create' ? 'bg-[#a67c52]/20 border-[#a67c52] text-[#e2b17a]' : 'bg-black/50 border-[#3d3326] text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
               >
                 Criar
               </button>
               <button 
                 onClick={() => setRoomMode('join')}
                 className={`flex-1 py-1 rounded text-[10px] font-bold uppercase border transition-colors ${roomMode === 'join' ? 'bg-[#a67c52]/20 border-[#a67c52] text-[#e2b17a]' : 'bg-black/50 border-[#3d3326] text-[#d4c3a1]/60 hover:text-[#d4c3a1]'}`}
               >
                 Entrar
               </button>
            </div>
    
            <form onSubmit={handlePrivateRoom} className="space-y-3">
              <input
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Nome da Sala"
                className="w-full bg-black/50 border border-[#3d3326] rounded px-4 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
              />
              <input
                type="password"
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                placeholder="Senha (Opcional)"
                className="w-full bg-black/50 border border-[#3d3326] rounded px-4 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
              />
              <button 
                type="submit" 
                disabled={searching}
                className="w-full bg-[#3d3326] hover:bg-[#a67c52]/50 disabled:opacity-50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2"
              >
                {searching ? 'Carregando...' : (roomMode === 'create' ? 'Criar Sala' : 'Entrar na Sala')}
              </button>
              {roomError && <p className="text-red-500 text-xs mt-1 text-center font-bold">{roomError}</p>}
            </form>
          </div>
    

          {/* Add Card */}
          <div className="bg-[#1a1814] border border-[#3d3326] p-6 rounded shadow-2xl">
            <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-4">Resgatar Código de Carta</h2>
            <form onSubmit={handleAddCard} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cardCodeInput}
                  onChange={(e) => setCardCodeInput(e.target.value)}
                  placeholder="Digite o código (ex: id da carta)"
                  className="w-full bg-black/50 border border-[#3d3326] rounded px-4 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52]"
                />
                <input
                  type="number"
                  min="1"
                  value={cardQuantityInput}
                  onChange={(e) => setCardQuantityInput(parseInt(e.target.value) || 1)}
                  className="w-20 bg-black/50 border border-[#3d3326] rounded px-2 py-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] text-center"
                />
              </div>
    
              <button type="submit" className="w-full bg-[#3d3326] hover:bg-[#a67c52]/50 text-[#d4c3a1] py-2 rounded text-xs font-bold uppercase transition-colors flex justify-center items-center gap-2">
                <Plus className="w-4 h-4" /> Adicionar ao Inventário
              </button>
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
              {message && <p className="text-green-500 text-xs mt-1">{message}</p>}
            </form>
          </div>
    

          {/* Deck Stats */}
           <div className="bg-[#1a1814] border border-[#3d3326] p-6 rounded shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase">Status do Baralho</h2>
                <button onClick={() => setShowDeckModal(true)} className="text-[10px] uppercase font-bold text-[#e2b17a] hover:text-white flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Ver Baralho
                </button>
              </div>
    

              <div className="flex flex-col gap-2 mb-4">
                 <div className="flex gap-2">
                   <select 
                     value={userData?.activeDeckId || 'default'} 
                     onChange={async (e) => {
                        const id = e.target.value;
                        const deck = (userData?.savedDecks || []).find(d => d.id === id);
                        if (deck) {
                           setDeckIds(deck.cards);
                           await updateDoc(doc(db, 'users', userData!.uid), { 
                             activeDeckId: id,
                             deck: deck.cards 
                           });
                        }
                     }}
                     className="flex-1 bg-black/50 border border-[#3d3326] rounded px-3 py-1.5 text-sm text-[#e2b17a] font-bold focus:outline-none focus:border-[#a67c52] uppercase tracking-widest text-[10px]"
                   >
                   {(userData?.savedDecks && userData.savedDecks.length > 0) ? (
                     userData.savedDecks.map(d => (
                       <option key={d.id} value={d.id}>{d.name}</option>
                     ))
                   ) : (
                     <option value="default">Baralho Padrão</option>
                   )}
                   </select>
                   {userData?.activeDeckId && userData.activeDeckId !== 'default' && (
                     <button 
                       type="button"
                       onClick={async () => {
                         if (!userData) return;
                           const updatedDecks = (userData.savedDecks || []).filter(d => d.id !== userData.activeDeckId);
                           const defaultDeck = updatedDecks.find(d => d.id === 'default') || { id: 'default', name: 'Baralho Padrão', cards: [] };
                           setDeckIds(defaultDeck.cards);
                           await updateDoc(doc(db, 'users', userData.uid), {
                             savedDecks: updatedDecks,
                             activeDeckId: 'default',
                             deck: defaultDeck.cards
                           });
                       }}
                       className="bg-red-900/50 hover:bg-red-800 text-red-200 px-3 py-1.5 rounded font-bold uppercase text-[10px] border border-red-900 transition-colors"
                     >
                       Apagar
                     </button>
                   )}
                 </div>
    

                 <form onSubmit={async (e) => {
                    e.preventDefault();
                    if(!deckNameInput.trim()) return;
                    const newId = Date.now().toString();
                    const newDeck = { id: newId, name: deckNameInput, cards: deckIds };
                    const currentDecks = userData?.savedDecks || [{ id: 'default', name: 'Baralho Padrão', cards: userData?.deck || [] }];
                    await updateDoc(doc(db, 'users', userData!.uid), {
                       savedDecks: [...currentDecks, newDeck],
                       activeDeckId: newId,
                       deck: deckIds
                    });
                    setDeckNameInput('');
                 }} className="flex gap-1">
                    <input 
                      type="text" 
                      placeholder="Novo Baralho" 
                      value={deckNameInput}
                      onChange={e => setDeckNameInput(e.target.value)}
                      className="flex-1 bg-black/50 border border-[#3d3326] rounded px-2 py-1 text-[10px] text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] uppercase"
                    />
                    <button type="submit" className="bg-[#3d3326] hover:bg-[#a67c52] text-[#d4c3a1] px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors">
                       Salvar
                    </button>
                 </form>
              </div>
    

              <div className="flex justify-between items-center text-sm border-t border-[#3d3326] pt-2">
                 <span className="text-[#d4c3a1]/60 text-xs uppercase font-bold">Total de Cartas</span>
                 <span className="font-mono text-[#e2b17a] font-bold">{deckIds.length}</span>
              </div>
    
           </div>
    

        </div>
    

        {/* Right Column: Inventory & Deck Builder */}
        <div className="lg:col-span-2">
          <div className="bg-[#141210] border border-[#3d3326] p-6 rounded shadow-2xl min-h-[500px] h-[800px] max-h-[85vh] flex flex-col">
            <div className="flex-none flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold tracking-tighter text-[#a67c52] uppercase mb-1">Seu Inventário</h2>
                <p className="text-[10px] uppercase tracking-widest text-[#d4c3a1]/60">Clique em uma carta para adicioná-la ou removê-la do seu baralho ativo.</p>
              </div>
    
              <button 
                onClick={() => setShowOnlyDeck(!showOnlyDeck)}
                className={`text-[10px] uppercase font-bold px-3 py-1.5 rounded transition-colors border ${showOnlyDeck ? 'bg-[#a67c52] text-black border-[#a67c52]' : 'bg-black/50 text-[#e2b17a] border-[#3d3326] hover:border-[#a67c52]'}`}
              >
                {showOnlyDeck ? 'Mostrar Todas' : 'Somente no Baralho'}
              </button>
            </div>
    
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {inventoryGrouped.length === 0 ? (
              <div className="text-center text-[#d4c3a1]/50 py-12 border border-dashed border-[#3d3326] rounded">
                Nenhuma carta no inventário. Resgate um código para começar.
              </div>
    
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                {inventoryGrouped.filter(({ card }) => !showOnlyDeck || (deckCounts[card.id] || 0) > 0).map(({ card, count }) => {
                  const inDeckCount = deckCounts[card.id] || 0;
                  return (
                    <div 
                      key={card.id}
                      className={`relative flex flex-col transition-transform hover:scale-105 ${inDeckCount > 0 ? 'ring-2 ring-[#a67c52] rounded' : ''}`}
                    >
                      <div className="relative cursor-pointer w-full group">
                        {inDeckCount > 0 && (
                          <div className="absolute top-1 right-1 bg-gradient-to-r from-[#a67c52] to-[#805e3b] text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg border border-[#e2b17a]">
                            NO BARALHO: {inDeckCount}
                          </div>
    
                        )}
                        <div className="absolute top-1 left-1 bg-black text-[#d4c3a1] text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow-lg border border-[#3d3326]">
                          x{count}
                        </div>
    
                        {card.imageUrl ? (
                          <img src={card.imageUrl} referrerPolicy="no-referrer" alt={card.name} className="w-full aspect-[2/3] object-contain rounded shadow-md border border-[#3d3326] bg-black/50" />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-[#3d3326] rounded border border-[#a67c52] flex flex-col items-center justify-center p-2 text-center">
                             <span className="text-xs font-bold uppercase">{card.name}</span>
                             <span className="text-xs text-[#a67c52] font-mono mt-1">{card.points} Pts</span>
                          </div>
    
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-[#0f0e0c]/90 opacity-0 group-hover:opacity-100 transition-opacity rounded p-3 flex flex-col justify-center text-center border border-[#a67c52]">
                           <span className="text-xs font-bold text-[#e2b17a] mb-1 uppercase">{card.name}</span>
                           <span className="text-[10px] text-[#d4c3a1]/80 line-clamp-3 italic">{card.description}</span>
                           <span className="text-[10px] text-[#a67c52] font-bold uppercase mt-2">{card.type}</span>
                        </div>
    
                      </div>
    
                      
                      {/* Controls */}
                                            <div className="flex mt-2 gap-1 bg-[#1a1814] p-1 rounded border border-[#3d3326]">
                        <button
                          onClick={() => setSelectedCardModal(card)}
                          className="flex-none w-8 bg-black hover:bg-[#3d3326] text-[#a67c52] font-bold py-1 rounded transition-colors flex justify-center items-center"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeckCard(card.id, 'remove')}

                          disabled={inDeckCount === 0}
                          className="flex-1 bg-black hover:bg-[#3d3326] disabled:opacity-50 text-red-500 font-bold py-1 rounded transition-colors text-xs flex justify-center items-center"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => handleDeckCard(card.id, 'add')}
                          disabled={inDeckCount >= count}
                          className="flex-1 bg-black hover:bg-[#3d3326] disabled:opacity-50 text-green-500 font-bold py-1 rounded transition-colors text-xs flex justify-center items-center"
                        >
                          +
                        </button>
                      </div>
    
                    </div>
    
                  );
                })}
              </div>
    
            )}
            </div>
    
          </div>
    
        </div>
    

      </div>
    
    </div>
    
  );
}
