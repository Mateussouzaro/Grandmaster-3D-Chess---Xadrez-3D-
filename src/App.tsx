import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import {
  GameMode,
  AIDifficulty,
  PieceColor,
  MoveRecord,
  GameStats,
  ChatMessage,
  TutorialLesson,
  SpectatorMatch,
  BoardThemeId,
  PieceThemeId,
  PlayerProfile,
  Achievement,
} from './types/chess';
import { ChessCanvas, ChessCanvasRef, CameraPreset } from './components/Chess3D/ChessCanvas';
import { GameHUD } from './components/GameHUD/GameHUD';
import { MoveHistoryModal } from './components/GameHUD/MoveHistoryModal';
import { PostGameModal } from './components/PostGameAnalysis/PostGameModal';
import { PromotionModal } from './components/Chess3D/PromotionModal';
import { TutorialModal } from './components/TutorialMode/TutorialModal';
import { OnlineLobbyModal } from './components/OnlineLobby/OnlineLobbyModal';
import { SpectatorModal } from './components/SpectatorMode/SpectatorModal';
import { CosmeticsModal } from './components/CosmeticsShop/CosmeticsModal';
import { ProfileModal } from './components/ProfileCustomizer/ProfileModal';
import { LeaderboardModal } from './components/Leaderboard/LeaderboardModal';
import { AchievementsModal } from './components/Achievements/AchievementsModal';
import { CharacterSelectModal } from './components/Characters/CharacterSelectModal';
import { CHESS_CHARACTERS, ChessCharacter } from './data/characters';
import { Navbar } from './components/Navigation/Navbar';
import { soundManager } from './utils/soundEffects';
import { getAIMove, getEvaluationInPawns, calculateMatchAccuracies } from './utils/aiEngine';
import { BOARD_THEMES, PIECE_THEMES } from './utils/themes';
import { TUTORIAL_LESSONS } from './utils/tutorials';
import { INITIAL_PROFILE, INITIAL_ACHIEVEMENTS, LIVE_SPECTATOR_MATCHES } from './utils/userData';

export default function App() {
  // Core Chess State
  const [chess, setChess] = useState<Chess>(new Chess());
  const [gameMode, setGameMode] = useState<GameMode>('local_pass_play');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [currentScrubIndex, setCurrentScrubIndex] = useState<number>(-1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Clocks (seconds, -1 for unlimited)
  const [timeControl, setTimeControl] = useState<number>(300); // 5 min default
  const [whiteTime, setWhiteTime] = useState<number>(300);
  const [blackTime, setBlackTime] = useState<number>(300);

  // Settings & HUD
  const [autoRotate, setAutoRotate] = useState<boolean>(true); // Auto 180° flip for Pass & Play!
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // AI settings
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(3); // Intermediário
  const [playerColorInAI, setPlayerColorInAI] = useState<PieceColor>('w');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // User Profile & Storage
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    const saved = localStorage.getItem('chess_profile_data');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    const saved = localStorage.getItem('chess_achievements_data');
    return saved ? JSON.parse(saved) : INITIAL_ACHIEVEMENTS;
  });

  // Tutorial State
  const [activeTutorialLesson, setActiveTutorialLesson] = useState<TutorialLesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([1]);

  // Online Multiplayer State
  const [roomCode, setRoomCode] = useState<string>('CHESS-7842');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', senderName: 'Sistema', text: 'Bem-vindo ao Xadrez 3D Online!', timestamp: Date.now(), isSystem: true },
  ]);

  // Spectator State
  const [spectatorMatch, setSpectatorMatch] = useState<SpectatorMatch | null>(null);

  // Modals Visibility
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPostGameModal, setShowPostGameModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [showSpectatorModal, setShowSpectatorModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<ChessCharacter>(CHESS_CHARACTERS[1]);
  const opponentCharacter = CHESS_CHARACTERS[0];

  // Post Game Stats
  const [postGameStats, setPostGameStats] = useState<GameStats | null>(null);

  // 3D Canvas Ref
  const canvasRef = useRef<ChessCanvasRef>(null);

  // Save profile & achievements to localStorage
  useEffect(() => {
    localStorage.setItem('chess_profile_data', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('chess_achievements_data', JSON.stringify(achievements));
  }, [achievements]);

  // Active board and piece themes
  const currentBoardTheme = BOARD_THEMES.find((t) => t.id === profile.equippedBoard) || BOARD_THEMES[0];
  const currentPieceTheme = PIECE_THEMES.find((t) => t.id === profile.equippedPiece) || PIECE_THEMES[0];

  // Helper: Get king square when in check
  const getCheckedKingSquare = useCallback((): Square | null => {
    if (!chess.inCheck()) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const file = String.fromCharCode(97 + c);
          return `${file}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [chess]);

  // Turn timer interval
  useEffect(() => {
    if (isGameOver || timeControl < 0 || activeTutorialLesson) return;

    const timer = setInterval(() => {
      if (chess.turn() === 'w') {
        setWhiteTime((prev) => {
          if (prev <= 1) {
            handleGameOver('timeout', 'b');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev) => {
          if (prev <= 1) {
            handleGameOver('timeout', 'w');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [chess, isGameOver, timeControl, activeTutorialLesson]);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }

      await document.documentElement.requestFullscreen();
      try {
        await screen.orientation?.lock('landscape');
      } catch {
        // Orientation lock is unavailable in some mobile browsers.
      }
    } catch {
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback((reason: GameStats['reason'], forcedWinner?: PieceColor | 'draw') => {
    setIsGameOver(true);

    let winner: PieceColor | 'draw' = 'draw';
    if (forcedWinner) {
      winner = forcedWinner;
    } else if (chess.isCheckmate()) {
      winner = chess.turn() === 'w' ? 'b' : 'w';
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
      winner = 'draw';
    }

    // Evaluate accuracies
    const evalScores = moveHistory.map((m) => m.evalScore || 0);
    const { whiteAcc, blackAcc } = calculateMatchAccuracies(evalScores);

    // Calculate captures
    const whiteCaps: string[] = [];
    const blackCaps: string[] = [];
    moveHistory.forEach((m) => {
      if (m.captured) {
        if (m.color === 'w') whiteCaps.push(m.captured);
        else blackCaps.push(m.captured);
      }
    });

    const stats: GameStats = {
      winner,
      reason,
      whiteAccuracy: whiteAcc,
      blackAccuracy: blackAcc,
      moveCount: moveHistory.length,
      durationSeconds: Math.max(10, (timeControl > 0 ? timeControl - Math.min(whiteTime, blackTime) : moveHistory.length * 5)),
      whiteCaptures: whiteCaps,
      blackCaptures: blackCaps,
      materialAdvantageHistory: evalScores,
      date: new Date().toLocaleDateString('pt-BR'),
      pgn: chess.pgn(),
      mode: gameMode,
    };

    setPostGameStats(stats);
    setShowPostGameModal(true);

    // Update player profile
    setProfile((prev) => {
      const isWin = (gameMode === 'vs_ai' && winner === playerColorInAI) || (gameMode === 'local_pass_play' && winner === 'w');
      const isLoss = (gameMode === 'vs_ai' && winner !== playerColorInAI && winner !== 'draw');
      const newElo = isWin ? prev.elo + 15 : isLoss ? Math.max(400, prev.elo - 12) : prev.elo;
      const earnedCoins = isWin ? 60 : 25;

      return {
        ...prev,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: isLoss ? prev.losses + 1 : prev.losses,
        draws: winner === 'draw' ? prev.draws + 1 : prev.draws,
        totalGames: prev.totalGames + 1,
        elo: newElo,
        highestElo: Math.max(prev.highestElo, newElo),
        coins: prev.coins + earnedCoins,
      };
    });
  }, [chess, moveHistory, timeControl, whiteTime, blackTime, gameMode, playerColorInAI]);

  // Execute a chess move
  const makeMove = useCallback(
    (from: Square, to: Square, promotionPiece?: 'q' | 'r' | 'b' | 'n') => {
      try {
        const nextChess = new Chess(chess.fen());
        const piece = nextChess.get(from);
        if (!piece) return false;

        // Check for promotion requirement
        const isPromotion =
          piece.type === 'p' &&
          ((piece.color === 'w' && to[1] === '8') || (piece.color === 'b' && to[1] === '1'));

        if (isPromotion && !promotionPiece) {
          setPendingPromotion({ from, to });
          return false;
        }

        const moveResult = nextChess.move({
          from,
          to,
          promotion: promotionPiece || 'q',
        });

        if (!moveResult) return false;

        // Sound effect
        if (moveResult.captured) {
          soundManager.playCapture();
        } else {
          soundManager.playMove();
        }

        if (nextChess.inCheck()) {
          soundManager.playCheck();
        }

        // Eval score
        const evalScore = getEvaluationInPawns(nextChess);

        const newRecord: MoveRecord = {
          san: moveResult.san,
          from,
          to,
          color: moveResult.color,
          piece: moveResult.piece,
          captured: moveResult.captured,
          fen: nextChess.fen(),
          timestamp: Date.now(),
          evalScore,
          isCheck: nextChess.inCheck(),
          isCheckmate: nextChess.isCheckmate(),
        };

        const updatedHistory = [...moveHistory, newRecord];
        setMoveHistory(updatedHistory);
        setCurrentScrubIndex(updatedHistory.length - 1);
        setLastMove({ from, to });
        setChess(nextChess);
        setSelectedSquare(null);
        setLegalMoves([]);

        // Check if tutorial lesson was satisfied
        if (activeTutorialLesson) {
          const isTarget = activeTutorialLesson.targetMove.some(
            (t) => t.from === from && t.to === to
          );
          if (isTarget) {
            soundManager.playVictory();
            setCompletedLessons((prev) =>
              prev.includes(activeTutorialLesson.id) ? prev : [...prev, activeTutorialLesson.id]
            );
            setProfile((prev) => ({
              ...prev,
              coins: prev.coins + activeTutorialLesson.coinsReward,
            }));
            setTimeout(() => {
              alert(`🎉 Lição Concluída!\n${activeTutorialLesson.successMessage}`);
              setShowTutorialModal(true);
            }, 600);
            return true;
          }
        }

        // Check game over
        if (nextChess.isGameOver()) {
          if (nextChess.isCheckmate()) {
            handleGameOver('checkmate');
          } else if (nextChess.isStalemate()) {
            handleGameOver('stalemate');
          } else if (nextChess.isThreefoldRepetition()) {
            handleGameOver('threefold');
          } else {
            handleGameOver('insufficient_material');
          }
        }

        return true;
      } catch (err) {
        console.error('Move error:', err);
        return false;
      }
    },
    [chess, moveHistory, activeTutorialLesson, handleGameOver]
  );

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (gameMode !== 'vs_ai' || isGameOver || activeTutorialLesson) return;

    const isAITurn = chess.turn() !== playerColorInAI;
    if (isAITurn) {
      setIsAiThinking(true);
      const timer = setTimeout(() => {
        const bestMove = getAIMove(chess.fen(), aiDifficulty);
        if (bestMove) {
          makeMove(bestMove.from as Square, bestMove.to as Square, bestMove.promotion as any);
        }
        setIsAiThinking(false);
      }, 500 + Math.random() * 400); // realistic human-like think delay

      return () => clearTimeout(timer);
    }
  }, [chess, gameMode, playerColorInAI, isGameOver, aiDifficulty, makeMove, activeTutorialLesson]);

  // Handle Square Click/Touch from 3D Canvas
  const handleSquareClick = useCallback(
    (sq: Square) => {
      if (isGameOver) return;

      // In vs AI mode, block clicking on AI turn
      if (gameMode === 'vs_ai' && chess.turn() !== playerColorInAI) return;

      // 1. If no square selected, try selecting piece of active turn
      if (!selectedSquare) {
        const piece = chess.get(sq);
        if (piece && piece.color === chess.turn()) {
          setSelectedSquare(sq);
          const moves = chess.moves({ square: sq, verbose: true }).map((m) => m.to);
          setLegalMoves(moves);
          soundManager.playClick();
        }
        return;
      }

      // 2. If clicking on own other piece, switch selection
      const targetPiece = chess.get(sq);
      if (targetPiece && targetPiece.color === chess.turn()) {
        setSelectedSquare(sq);
        const moves = chess.moves({ square: sq, verbose: true }).map((m) => m.to);
        setLegalMoves(moves);
        soundManager.playClick();
        return;
      }

      // 3. Try making move to target square
      if (legalMoves.includes(sq)) {
        makeMove(selectedSquare, sq);
      } else {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    },
    [chess, selectedSquare, legalMoves, isGameOver, gameMode, playerColorInAI, makeMove]
  );

  // Reset Game
  const resetGame = useCallback(
    (customFen?: string, mode?: GameMode) => {
      const newGame = new Chess(customFen || undefined);
      setChess(newGame);
      setSelectedSquare(null);
      setLegalMoves([]);
      setMoveHistory([]);
      setCurrentScrubIndex(-1);
      setIsGameOver(false);
      setLastMove(null);
      setPendingPromotion(null);
      setWhiteTime(timeControl);
      setBlackTime(timeControl);
      if (mode) setGameMode(mode);
    },
    [timeControl]
  );

  // Undo Move (Takeback)
  const handleUndoMove = () => {
    if (moveHistory.length === 0 || isGameOver) return;
    const next = new Chess();
    // If playing vs AI, undo 2 moves so it's user's turn again
    const stepsToUndo = gameMode === 'vs_ai' && moveHistory.length >= 2 ? 2 : 1;
    const newHistory = moveHistory.slice(0, moveHistory.length - stepsToUndo);

    newHistory.forEach((m) => {
      next.move({ from: m.from, to: m.to, promotion: 'q' });
    });

    setChess(next);
    setMoveHistory(newHistory);
    setCurrentScrubIndex(newHistory.length - 1);
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(newHistory.length > 0 ? { from: newHistory[newHistory.length - 1].from, to: newHistory[newHistory.length - 1].to } : null);
    soundManager.playClick();
  };

  // Get AI Hint
  const handleGetHint = () => {
    if (isGameOver) return;
    const hint = getAIMove(chess.fen(), 5);
    if (hint) {
      setSelectedSquare(hint.from as Square);
      setLegalMoves([hint.to]);
      soundManager.playClick();
    }
  };

  // Handle Tutorial Lesson Start
  const handleStartTutorialLesson = (lesson: TutorialLesson) => {
    setActiveTutorialLesson(lesson);
    resetGame(lesson.initialFen, 'tutorial');
  };

  // Handle Spectator Match Watch
  const handleWatchSpectatorMatch = (match: SpectatorMatch) => {
    setSpectatorMatch(match);
    resetGame(match.initialFen, 'spectator');
  };

  // Handle Online Match Start
  const handleStartOnlineMatch = (code: string) => {
    setRoomCode(code);
    resetGame(undefined, 'online');
    setChatMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), senderName: 'Sistema', text: `Conectado à sala ${code}!`, timestamp: Date.now(), isSystem: true },
    ]);
  };

  // Send Chat message
  const handleSendChatMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderName: profile.name,
      senderColor: chess.turn(),
      text,
      timestamp: Date.now(),
    };
    setChatMessages((prev) => [...prev, newMsg]);

    // Simulated responsive reply in online mode
    setTimeout(() => {
      const replies = ['Boa!', 'Jogada interessante...', 'Vamos nessa! ♟️', 'Excelente lance!'];
      const autoReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        senderName: 'Adversário Online',
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, autoReply]);
    }, 1500);
  };

  // Scrub through move history
  const handleSelectScrubMove = (index: number) => {
    setCurrentScrubIndex(index);
    const scrubChess = new Chess();
    for (let i = 0; i <= index; i++) {
      const m = moveHistory[i];
      if (m) scrubChess.move({ from: m.from, to: m.to, promotion: 'q' });
    }
    setChess(scrubChess);
  };

  // Buy Board / Piece
  const handleBuyBoard = (theme: typeof BOARD_THEMES[0]) => {
    if (profile.coins >= theme.price) {
      setProfile((prev) => ({
        ...prev,
        coins: prev.coins - theme.price,
        unlockedBoards: [...prev.unlockedBoards, theme.id],
        equippedBoard: theme.id,
      }));
      soundManager.playVictory();
    }
  };

  const handleBuyPiece = (theme: typeof PIECE_THEMES[0]) => {
    if (profile.coins >= theme.price) {
      setProfile((prev) => ({
        ...prev,
        coins: prev.coins - theme.price,
        unlockedPieces: [...prev.unlockedPieces, theme.id],
        equippedPiece: theme.id,
      }));
      soundManager.playVictory();
    }
  };

  // Computed captured pieces lists
  const whiteCaptures = moveHistory.filter((m) => m.color === 'w' && m.captured).map((m) => m.captured!);
  const blackCaptures = moveHistory.filter((m) => m.color === 'b' && m.captured).map((m) => m.captured!);

  // AI bot player name
  const aiNames = ['Iniciante (800)', 'Amador (1200)', 'Intermediário (1500)', 'Avançado (1850)', 'Grão-Mestre (2200)'];
  const opponentName =
    gameMode === 'vs_ai'
      ? `IA ${aiNames[aiDifficulty - 1]}`
      : gameMode === 'local_pass_play'
      ? 'Jogador 2 (Pretas)'
      : gameMode === 'spectator' && spectatorMatch
      ? spectatorMatch.blackPlayer.name
      : 'Adversário Online';

  const myPlayerName =
    gameMode === 'local_pass_play'
      ? 'Jogador 1 (Brancas)'
      : gameMode === 'spectator' && spectatorMatch
      ? spectatorMatch.whitePlayer.name
      : profile.name;

  return (
    <div className={`relative w-screen h-screen flex flex-col bg-gradient-to-b ${currentBoardTheme.backgroundStyle} text-white overflow-hidden select-none`}>
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:48px_48px]" aria-hidden="true" />
      {/* Top Main Navigation */}
      <Navbar
        currentMode={gameMode}
        onSelectMode={(mode) => {
          if (mode === 'tutorial') {
            setShowTutorialModal(true);
          } else if (mode === 'online') {
            setShowOnlineModal(true);
          } else if (mode === 'spectator') {
            setShowSpectatorModal(true);
          } else {
            setActiveTutorialLesson(null);
            resetGame(undefined, mode);
          }
        }}
        playerCoins={profile.coins}
        playerElo={profile.elo}
        onOpenShop={() => setShowShopModal(true)}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
  onOpenAchievements={() => setShowAchievementsModal(true)}
  isFullscreen={isFullscreen}
  onToggleFullscreen={toggleFullscreen}
  />

      {/* Sub-Header: Mode contextual info & quick settings */}
      <div className="bg-stone-950/60 backdrop-blur-md border-b border-white/5 px-3 py-1.5 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {gameMode === 'local_pass_play' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">📱 2 Jogadores no Mesmo Celular:</span>
              <span className="text-stone-300 hidden sm:inline">Toque nas casas para jogar. O tabuleiro gira a cada turno!</span>
              {/* Time Control Picker */}
              <div className="flex items-center gap-1 ml-2">
                {[
                  { label: 'Sem tempo', val: -1 },
                  { label: '3 min', val: 180 },
                  { label: '5 min', val: 300 },
                  { label: '10 min', val: 600 },
                ].map((tc) => (
                  <button
                    key={tc.val}
                    onClick={() => {
                      setTimeControl(tc.val);
                      setWhiteTime(tc.val);
                      setBlackTime(tc.val);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      timeControl === tc.val ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    {tc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameMode === 'vs_ai' && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">🤖 Dificuldade da IA:</span>
              <div className="flex items-center gap-1">
                {([1, 2, 3, 4, 5] as AIDifficulty[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setAiDifficulty(level)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      aiDifficulty === level ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    Nv {level}
                  </button>
                ))}
              </div>
              {isAiThinking && (
                <span className="text-amber-400 text-[11px] animate-pulse font-mono ml-2">
                  IA calculando melhor lance...
                </span>
              )}
            </div>
          )}

          {gameMode === 'tutorial' && activeTutorialLesson && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">📚 Lição: {activeTutorialLesson.title}</span>
              <span className="text-stone-300 text-[11px] hidden sm:inline">· {activeTutorialLesson.instruction}</span>
              <button
                onClick={() => setShowTutorialModal(true)}
                className="px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-semibold text-[11px] hover:bg-stone-700"
              >
                Trocar Lição
              </button>
            </div>
          )}

          {gameMode === 'spectator' && spectatorMatch && (
            <div className="flex items-center gap-2">
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                AO VIVO:
              </span>
              <span className="text-stone-200 text-[11px]">
                {spectatorMatch.whitePlayer.name} vs {spectatorMatch.blackPlayer.name}
              </span>
              <button
                onClick={() => setShowSpectatorModal(true)}
                className="px-2 py-0.5 rounded bg-purple-900/60 border border-purple-500/40 text-purple-200 text-[11px] font-semibold"
              >
                Outras Partidas
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCharacterModal(true)}
            className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-500/20"
            title="Escolher personagem"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-stone-950" style={{ backgroundColor: selectedCharacter.color }}>{selectedCharacter.initials}</span>
            <span className="hidden sm:inline">{selectedCharacter.name}</span>
          </button>
          <button
            onClick={() => resetGame()}
            className="rounded-lg border border-stone-800 bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-stone-300 transition-all hover:bg-stone-800 hover:text-white"
          >
            Reiniciar Jogo
          </button>
        </div>
      </div>

      {/* Main 3D Interactive Stage */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {/* 3D WebGL Canvas */}
        <ChessCanvas
          ref={canvasRef}
          chess={chess}
          boardTheme={currentBoardTheme}
          pieceTheme={currentPieceTheme}
          playerOrientation={playerColorInAI}
          autoRotatePassAndPlay={gameMode === 'local_pass_play' && autoRotate}
          activeTurn={chess.turn()}
          onSquareClick={handleSquareClick}
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          lastMove={lastMove}
          isCheck={chess.inCheck()}
          checkedKingSquare={getCheckedKingSquare()}
          whiteCharacter={selectedCharacter}
          blackCharacter={opponentCharacter}
        />

        {/* Tactical HUD Overlay (Clocks, Turn Indicator, Camera tools, HUD buttons) */}
        <GameHUD
          playerWhite={{ name: `${selectedCharacter.name} · ${myPlayerName}`, title: selectedCharacter.role, avatar: profile.avatarId, elo: profile.elo }}
          playerBlack={{ name: `${opponentCharacter.name} · ${opponentName}`, title: opponentCharacter.role, avatar: 'avatar_speed', elo: 1300 }}
          activeTurn={chess.turn()}
          whiteTime={whiteTime}
          blackTime={blackTime}
          whiteCaptures={whiteCaptures}
          blackCaptures={blackCaptures}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          onManualFlipCamera={() => canvasRef.current?.flipOrientation()}
          onSelectCameraPreset={(preset) => canvasRef.current?.setCameraPreset(preset)}
          onUndoMove={handleUndoMove}
          onGetHint={handleGetHint}
          onResign={() => handleGameOver('resignation', chess.turn() === 'w' ? 'b' : 'w')}
          onOfferDraw={() => handleGameOver('draw_agreed', 'draw')}
          onOpenMoveHistory={() => setShowHistoryModal(true)}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundManager.setMuted(next);
          }}
          gameMode={gameMode}
          isGameOver={isGameOver}
          canUndo={gameMode !== 'online'}
        />
      </main>

      <CharacterSelectModal
        isOpen={showCharacterModal}
        selectedId={selectedCharacter.id}
        onSelect={(character) => setSelectedCharacter(character)}
        onClose={() => setShowCharacterModal(false)}
      />

      {/* Move History / Notation Modal */}
      <MoveHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        moves={moveHistory}
        currentMoveIndex={currentScrubIndex}
        onSelectMoveIndex={handleSelectScrubMove}
        pgn={chess.pgn()}
      />

      {/* Pawn Promotion Modal */}
      <PromotionModal
        isOpen={pendingPromotion !== null}
        color={chess.turn()}
        onSelectPiece={(piece) => {
          if (pendingPromotion) {
            makeMove(pendingPromotion.from, pendingPromotion.to, piece);
            setPendingPromotion(null);
          }
        }}
      />

      {/* Post Game Stats & Social Share Card Modal */}
      {postGameStats && (
        <PostGameModal
          isOpen={showPostGameModal}
          onClose={() => setShowPostGameModal(false)}
          stats={postGameStats}
          playerWhiteName={myPlayerName}
          playerBlackName={opponentName}
          onRematch={() => resetGame()}
          onReviewBoard={() => setShowPostGameModal(false)}
        />
      )}

      {/* Tutorial School Modal */}
      <TutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
        currentLessonId={activeTutorialLesson?.id || 1}
        completedLessonIds={completedLessons}
        onStartLesson={handleStartTutorialLesson}
      />

      {/* Online Matchmaking & Chat Modal */}
      <OnlineLobbyModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        roomCode={roomCode}
        isOnlineActive={gameMode === 'online'}
        onStartOnlineMatch={handleStartOnlineMatch}
        chatMessages={chatMessages}
        onSendMessage={handleSendChatMessage}
        myColor="w"
      />

      {/* Spectator Mode Modal */}
      <SpectatorModal
        isOpen={showSpectatorModal}
        onClose={() => setShowSpectatorModal(false)}
        onWatchMatch={handleWatchSpectatorMatch}
      />

      {/* Cosmetics Shop & Monetization Modal */}
      <CosmeticsModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        playerCoins={profile.coins}
        unlockedBoards={profile.unlockedBoards}
        unlockedPieces={profile.unlockedPieces}
        equippedBoard={profile.equippedBoard}
        equippedPiece={profile.equippedPiece}
        onBuyBoard={handleBuyBoard}
        onBuyPiece={handleBuyPiece}
        onEquipBoard={(id) => setProfile((p) => ({ ...p, equippedBoard: id }))}
        onEquipPiece={(id) => setProfile((p) => ({ ...p, equippedPiece: id }))}
      />

      {/* Player Profile & Detailed Stats Database Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
      />

      {/* Global ELO Leaderboard Modal */}
      <LeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        playerElo={profile.elo}
      />

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        achievements={achievements}
      />
    </div>
  );
}
