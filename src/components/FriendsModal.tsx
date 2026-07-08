import React, { useState, useEffect } from 'react';
import { updateDoc, doc, getDoc, collection, query, where, getDocs, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logActivity } from '../lib/activity';
import { loadAllCards, getCachedCard } from '../lib/cardsCache';
import { User, GameState, Card } from '../types';
import { UserPlus, UserMinus, Search, Users } from 'lucide-react';

import { ArrowRightLeft, Check, X, Swords } from 'lucide-react';

interface Props {
  userData: User;
  onClose: () => void;
  onTrade: (tradeId: string) => void;
  onChallenge: (gameId: string) => void;
}

export function FriendsModal({ userData, onClose, onTrade, onChallenge }: Props) {
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<User[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  }, [userData.friends, userData.friendRequests]);

  const fetchRequests = async () => {
    if (!userData.friendRequests || userData.friendRequests.length === 0) {
      setFriendRequests([]);
      return;
    }
    try {
      const reqsData: User[] = [];
      for (const uid of userData.friendRequests) {
        const uDoc = await getDoc(doc(db, 'users', uid));
        if (uDoc.exists()) reqsData.push(uDoc.data() as User);
      }
      setFriendRequests(reqsData);
    } catch (e) { console.error(e); }
  };

  const fetchFriends = async () => {
    if (!userData.friends || userData.friends.length === 0) {
      setFriends([]);
      return;
    }
    try {
      const friendsData: User[] = [];
      for (const uid of userData.friends) {
        const uDoc = await getDoc(doc(db, 'users', uid));
        if (uDoc.exists()) {
          friendsData.push(uDoc.data() as User);
        }
      }
      setFriends(friendsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async () => {
    if (!searchEmail) return;
    setLoading(true);
    setError('');
    setSearchResult(null);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data() as User;
        if (foundUser.uid === userData.uid) {
          setError('Você não pode adicionar a si mesmo.');
        } else {
          setSearchResult(foundUser);
        }
      } else {
        setError('Usuário não encontrado.');
      }
    } catch (e) {
      console.error(e);
      setError('Erro ao buscar usuário.');
    }
    setLoading(false);
  };

  const sendFriendRequest = async (friendUid: string) => {
    try {
      await updateDoc(doc(db, 'users', friendUid), {
        friendRequests: arrayUnion(userData.uid)
      });
      alert('Pedido enviado!');
      setSearchResult(null);
    } catch (e) { console.error(e); setError('Erro ao enviar pedido.'); }
  };

  const acceptRequest = async (requesterUid: string) => {
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        friends: arrayUnion(requesterUid),
        friendRequests: arrayRemove(requesterUid)
      });
      await updateDoc(doc(db, 'users', requesterUid), {
        friends: arrayUnion(userData.uid)
      });
      await logActivity(userData.uid, userData.username, 'add_friend', `Adicionou ${requesterUid} como amigo`);
    } catch(e) { console.error(e); }
  };

  const rejectRequest = async (requesterUid: string) => {
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        friendRequests: arrayRemove(requesterUid)
      });
      
    } catch(e) { console.error(e); }
  };

  const removeFriend = async (friendUid: string) => {
    try {
      await updateDoc(doc(db, 'users', userData.uid), {
        friends: arrayRemove(friendUid)
      });
      await logActivity(userData.uid, userData.username, 'remove_friend', `Removeu ${friendUid} dos amigos`);
    } catch (e) {
      console.error(e);
    }
  };

  const challengeFriend = async (friend: User) => {
    if (!userData.deck || userData.deck.length !== 10) {
       alert('Você precisa de exatamente 10 cartas no baralho para jogar.');
       return;
    }
    try {
       await loadAllCards();
       const p1Deck: Card[] = (userData.deck || []).map(cid => getCachedCard(cid)).filter(Boolean) as Card[];
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
            uid: friend.uid,
            username: friend.username,
            profile: friend.profile || null,
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
          roomName: `Desafio de ${userData.username}`,
          roomPassword: ''
       };
       const newGameRef = await addDoc(collection(db, 'games'), newGameData);
       // Assuming Dashboard will pass a callback to navigate
       onChallenge(newGameRef.id);
    } catch (e) {
       console.error(e);
       alert('Erro ao desafiar amigo.');
    }
  };

  const initiateTrade = async (friend: User) => {
    try {
       const newTrade = {
          participants: [userData.uid, friend.uid],
          p1: {
            uid: userData.uid,
            username: userData.username,
            cardId: null,
            agreed: false
          },
          p2: {
            uid: friend.uid,
            username: friend.username,
            cardId: null,
            agreed: false
          },
          status: 'pending'
       };
       const tRef = await addDoc(collection(db, 'trades'), newTrade);
       onTrade(tRef.id);
    } catch (e) {
       console.error('Error creating trade', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-serif">
      <div className="bg-[#1a1814] border-2 border-[#3d3326] p-6 rounded-md w-full max-w-2xl text-[#d4c3a1] shadow-2xl relative flex flex-col h-[80vh]">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-[#e2b17a] mb-6 text-center border-b border-[#3d3326] pb-2 flex items-center justify-center gap-2">
          <Users className="w-6 h-6" /> Lista de Amigos
        </h2>
        
        <div className="flex gap-4 h-full overflow-hidden flex-col md:flex-row">
          {/* Add Friend Section */}
          <div className="flex-1 md:border-r border-[#3d3326] md:pr-4 flex flex-col mb-4 md:mb-0">
            <h3 className="text-sm font-bold uppercase text-[#a67c52] mb-4">Adicionar Amigo</h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 bg-[#0f0e0c] border border-[#3d3326] rounded p-2 text-sm text-[#d4c3a1] focus:outline-none focus:border-[#a67c52] transition-colors"
                placeholder="Email do usuário..."
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="p-2 bg-[#3d3326] text-[#d4c3a1] rounded hover:bg-[#a67c52] transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
            
            {error && <p className="text-red-500 text-xs mb-4 font-bold">{error}</p>}
            
            {searchResult && (
              <div className="bg-[#0f0e0c] border border-[#3d3326] p-4 rounded flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {searchResult.profile?.avatarUrl ? (
                    <img src={searchResult.profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-[#3d3326] object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#3d3326] flex items-center justify-center font-bold">?</div>
                  )}
                  <div>
                    <div 
                      className={searchResult.profile?.font || "font-sans"} 
                      style={{ color: searchResult.profile?.color || "#d4c3a1", fontWeight: 'bold' }}
                    >
                      {searchResult.username}
                    </div>
                  </div>
                </div>
                {!userData.friends?.includes(searchResult.uid) ? (
                  <button 
                    onClick={() => sendFriendRequest(searchResult.uid)}
                    className="p-2 bg-[#a67c52] text-[#0f0e0c] rounded hover:bg-[#e2b17a] transition-colors flex items-center gap-1 text-xs uppercase font-bold"
                  >
                    <UserPlus className="w-4 h-4" /> Adicionar
                  </button>
                ) : (
                  <span className="text-xs uppercase text-[#a67c52] font-bold">Já é amigo</span>
                )}
              </div>
            )}
          </div>

          {/* Friends List */}
          <div className="flex-1 md:pl-4 overflow-y-auto">
             {friendRequests.length > 0 && (
               <div className="mb-6">
                 <h3 className="text-sm font-bold uppercase text-[#e2b17a] mb-2">Pedidos de Amizade ({friendRequests.length})</h3>
                 <div className="space-y-2">
                   {friendRequests.map(req => (
                     <div key={req.uid} className="bg-[#3d3326] p-2 rounded flex items-center justify-between">
                       <span className="text-xs font-bold">{req.username}</span>
                       <div className="flex gap-2">
                         <button onClick={() => acceptRequest(req.uid)} className="p-1 bg-green-600/50 hover:bg-green-600 rounded text-white" title="Aceitar"><Check className="w-4 h-4" /></button>
                         <button onClick={() => rejectRequest(req.uid)} className="p-1 bg-red-600/50 hover:bg-red-600 rounded text-white" title="Recusar"><X className="w-4 h-4" /></button>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
             <h3 className="text-sm font-bold uppercase text-[#a67c52] mb-4">Meus Amigos ({friends.length})</h3>
             {friends.length === 0 ? (
               <p className="text-[#d4c3a1]/50 text-sm italic">Nenhum amigo adicionado.</p>
             ) : (
               <div className="space-y-3">
                 {friends.map(friend => (
                   <div key={friend.uid} className="bg-[#0f0e0c] border border-[#3d3326] p-3 rounded flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        {friend.profile?.avatarUrl ? (
                          <img src={friend.profile.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border border-[#3d3326] object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#3d3326] flex items-center justify-center font-bold">?</div>
                        )}
                        <div 
                          className={friend.profile?.font || "font-sans"} 
                          style={{ color: friend.profile?.color || "#d4c3a1", fontWeight: 'bold' }}
                        >
                          {friend.username}
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                       <button 
                         onClick={() => challengeFriend(friend)}
                         className="p-1.5 bg-blue-900/50 text-blue-400 rounded hover:bg-blue-800 transition-colors flex items-center gap-1"
                         title="Desafiar"
                       >
                         <Swords className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => initiateTrade(friend)}
                         className="p-1.5 bg-[#a67c52]/20 text-[#a67c52] rounded hover:bg-[#a67c52]/40 transition-colors flex items-center gap-1"
                         title="Trocar Cartas"
                       >
                         <ArrowRightLeft className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => removeFriend(friend.uid)}
                         className="p-1.5 bg-red-950/50 text-red-500 rounded hover:bg-red-900 transition-colors"
                         title="Remover Amigo"
                       >
                         <UserMinus className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-[#3d3326]">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-[#a67c52] uppercase font-bold text-xs hover:bg-[#3d3326] rounded transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
