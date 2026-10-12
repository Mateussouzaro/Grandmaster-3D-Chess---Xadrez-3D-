export type PieceColor = 'w' | 'b';
export type GameMode = 'local_pass_play' | 'vs_ai' | 'online' | 'spectator' | 'tutorial' | 'analysis';
export type AIDifficulty = 1 | 2 | 3 | 4 | 5; // 1: Iniciante, 2: Amador, 3: Intermediário, 4: Avançado, 5: Mestre

export type BoardThemeId = 'classic_wood' | 'marble' | 'obsidian_gold' | 'cyberpunk' | 'emerald';
export type PieceThemeId = 'staunton' | 'royal_gold' | 'minimalist' | 'cyber_neon';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  description: string;
  lightSquare: number;
  darkSquare: number;
  frameColor: number;
  price: number;
  isUnlocked: boolean;
  backgroundStyle: string;
}

export interface PieceTheme {
  id: PieceThemeId;
  name: string;
  description: string;
  whiteColor: number;
  whiteRoughness: number;
  whiteMetalness: number;
  blackColor: number;
  blackRoughness: number;
  blackMetalness: number;
  price: number;
  isUnlocked: boolean;
}

export interface PlayerProfile {
  id: string;
  name: string;
  title: string;
  avatarId: string;
  frameId: string;
  country: string;
  elo: number;
  highestElo: number;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  avgAccuracy: number;
  coins: number;
  unlockedBoards: BoardThemeId[];
  unlockedPieces: PieceThemeId[];
  equippedBoard: BoardThemeId;
  equippedPiece: PieceThemeId;
}

export interface MoveRecord {
  san: string;
  from: string;
  to: string;
  color: PieceColor;
  piece: string;
  captured?: string;
  fen: string;
  timestamp: number;
  evalScore?: number; // material balance in pawns
  isCheck?: boolean;
  isCheckmate?: boolean;
}

export interface GameStats {
  winner: PieceColor | 'draw' | null;
  reason: 'checkmate' | 'timeout' | 'resignation' | 'stalemate' | 'draw_agreed' | 'insufficient_material' | 'threefold' | null;
  whiteAccuracy: number;
  blackAccuracy: number;
  moveCount: number;
  durationSeconds: number;
  whiteCaptures: string[];
  blackCaptures: string[];
  materialAdvantageHistory: number[]; // evaluated in pawns for white (+ = white adv, - = black adv)
  date: string;
  pgn: string;
  mode: GameMode;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderColor?: PieceColor;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface SpectatorMatch {
  id: string;
  whitePlayer: { name: string; title: string; elo: number; avatar: string };
  blackPlayer: { name: string; title: string; elo: number; avatar: string };
  spectatorsCount: number;
  timeControl: string;
  initialFen: string;
  currentMoves: string[];
  evalAdvantage: number; // +3.2 or -1.5
}

export interface TutorialLesson {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  initialFen: string;
  playerColor: PieceColor;
  targetMove: { from: string; to: string }[];
  instruction: string;
  successMessage: string;
  coinsReward: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewardCoins: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  title: string;
  avatar: string;
  country: string;
  elo: number;
  winRate: number;
  gamesPlayed: number;
}
