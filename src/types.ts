export type CardType = 'Melee' | 'Ranged' | 'Cenário' | 'Trap' | 'Magic' | 'Heal' | 'Event';

export interface Card {
  id: string; // The code
  name: string;
  description: string;
  type: CardType;
  points: number;
  imageUrl: string;
  backgroundUrl?: string;
  effects: string[];
  buffTargetName?: string;
  debuffTargetName?: string;
  buffTargetNames?: string[];
  debuffTargetNames?: string[];
}

export interface UserProfile {
  font?: string;
  color?: string;
  avatarUrl?: string;
}

export interface MatchRecord {
  gameId: string;
  opponentName: string;
  opponentId: string;
  result: 'win' | 'loss' | 'draw';
  date: string;
}

export interface SavedDeck {
  id: string;
  name: string;
  cards: string[];
}

export interface User {
  uid: string;
  email: string;
  username: string;
  role: 'admin' | 'player';
  inventory: string[]; // array of Card IDs
  deck: string[]; // array of Card IDs
  savedDecks?: SavedDeck[];
  activeDeckId?: string;
  profile?: UserProfile;
  friends?: string[]; // array of UIDs
  friendRequests?: string[]; // array of UIDs that sent requests
  matchHistory?: MatchRecord[];
  hasAllCards?: boolean;
}

export interface GamePlayerState {
  uid: string;
  username: string;
  deck: Card[];
  hand: Card[];
  graveyard: Card[];
  board: {
    melee: Card[];
    ranged: Card[];
    scenario: Card | null;
  };
  score: number;
  passed: boolean;
  roundsWon: number;
  initialDraw?: boolean;
  profile?: UserProfile;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface GameState {
  id: string;
  player1: GamePlayerState;
  player2: GamePlayerState | null; // null if waiting for opponent
  status: 'waiting' | 'playing' | 'finished' | 'challenge' | 'declined';
  turn: string; // uid of the player whose turn it is
  round: number;
  winner: string | null;
  isPrivate?: boolean;
  isBotMatch?: boolean;
  botDifficulty?: 'easy' | 'normal' | 'hard' | 'expert';
  isTutorial?: boolean;
  tutorialStep?: number;
  roomName?: string;
  roomPassword?: string;
  rematchGameId?: string;
  chatMessages?: ChatMessage[];
}
