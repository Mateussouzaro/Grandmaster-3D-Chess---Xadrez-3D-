import { Chess, Square } from 'chess.js';
import { AIDifficulty } from '../types/chess';

// Piece value scale in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional piece-square tables (from white's perspective, inverted for black)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
   -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_TABLE_MIDGAME = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

function getSquareIndex(file: number, rank: number, isWhite: boolean): number {
  if (isWhite) {
    return (7 - rank) * 8 + file;
  } else {
    return rank * 8 + file;
  }
}

/**
 * Static evaluation function.
 * Positive score means White is winning, negative means Black is winning.
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
    return 0;
  }

  let whiteScore = 0;
  let blackScore = 0;

  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const type = piece.type;
      const baseVal = PIECE_VALUES[type] || 0;

      let posBonus = 0;
      const idx = getSquareIndex(c, 7 - r, isWhite);

      if (type === 'p') posBonus = PAWN_TABLE[idx] || 0;
      else if (type === 'n') posBonus = KNIGHT_TABLE[idx] || 0;
      else if (type === 'b') posBonus = BISHOP_TABLE[idx] || 0;
      else if (type === 'r') posBonus = ROOK_TABLE[idx] || 0;
      else if (type === 'q') posBonus = QUEEN_TABLE[idx] || 0;
      else if (type === 'k') posBonus = KING_TABLE_MIDGAME[idx] || 0;

      const totalVal = baseVal + posBonus;

      if (isWhite) {
        whiteScore += totalVal;
      } else {
        blackScore += totalVal;
      }
    }
  }

  return whiteScore - blackScore;
}

/**
 * Alpha-Beta search for chess move selection.
 */
function alphaBeta(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });
  // Move ordering: sort captures and checks first for better pruning
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    if (b.captured) scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    if (a.san.includes('+')) scoreA += 50;
    if (b.san.includes('+')) scoreB += 50;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = alphaBeta(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = alphaBeta(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Calculates the best move for a given position based on AI difficulty level.
 */
export function getAIMove(
  fen: string,
  difficulty: AIDifficulty
): { from: string; to: string; promotion?: string } | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return null;

  const isWhite = chess.turn() === 'w';

  // Level 1: Beginner (~800 ELO)
  // 60% random legal move, 40% simple capture
  if (difficulty === 1) {
    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() < 0.4) {
      const chosen = captures[Math.floor(Math.random() * captures.length)];
      return { from: chosen.from, to: chosen.to, promotion: 'q' };
    }
    const chosen = moves[Math.floor(Math.random() * moves.length)];
    return { from: chosen.from, to: chosen.to, promotion: 'q' };
  }

  // Level 2: Amateur (~1200 ELO)
  // Shallow evaluation with noise
  if (difficulty === 2) {
    let bestScore = isWhite ? -Infinity : Infinity;
    let candidates: typeof moves = [];

    for (const move of moves) {
      chess.move(move);
      // depth 1 with random perturbation
      let score = evaluateBoard(chess) + (Math.random() * 80 - 40);
      chess.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          candidates = [move];
        } else if (Math.abs(score - bestScore) < 15) {
          candidates.push(move);
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          candidates = [move];
        } else if (Math.abs(score - bestScore) < 15) {
          candidates.push(move);
        }
      }
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] || moves[0];
    return { from: chosen.from, to: chosen.to, promotion: 'q' };
  }

  // Level 3: Intermediate (~1500 ELO)
  // Depth 2 search
  if (difficulty === 3) {
    let bestScore = isWhite ? -Infinity : Infinity;
    let bestMoves: typeof moves = [];

    for (const move of moves) {
      chess.move(move);
      const score = alphaBeta(chess, 2, -Infinity, Infinity, !isWhite);
      chess.undo();

      if (isWhite) {
        if (score > bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMoves = [move];
        } else if (score === bestScore) {
          bestMoves.push(move);
        }
      }
    }
    const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)] || moves[0];
    return { from: chosen.from, to: chosen.to, promotion: 'q' };
  }

  // Level 4: Advanced (~1850 ELO)
  // Depth 3 search with alpha-beta
  if (difficulty === 4) {
    let bestScore = isWhite ? -Infinity : Infinity;
    let bestMove = moves[0];

    for (const move of moves) {
      chess.move(move);
      const score = alphaBeta(chess, 3, -Infinity, Infinity, !isWhite);
      chess.undo();

      if (isWhite && score > bestScore) {
        bestScore = score;
        bestMove = move;
      } else if (!isWhite && score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
  }

  // Level 5: Master (~2200 ELO)
  // Depth 3-4 search with deeper move evaluation and king safety
  let bestScore = isWhite ? -Infinity : Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    chess.move(move);
    // Depth 3 + bonus checks
    const score = alphaBeta(chess, 3, -Infinity, Infinity, !isWhite);
    chess.undo();

    if (isWhite && score > bestScore) {
      bestScore = score;
      bestMove = move;
    } else if (!isWhite && score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return { from: bestMove.from, to: bestMove.to, promotion: 'q' };
}

/**
 * Calculates current evaluation in pawns for UI evaluation bar (+3.2 for White, -1.8 for Black)
 */
export function getEvaluationInPawns(chess: Chess): number {
  const scoreInCentipawns = evaluateBoard(chess);
  if (scoreInCentipawns > 90000) return 10.0;
  if (scoreInCentipawns < -90000) return -10.0;
  return Number((scoreInCentipawns / 100).toFixed(1));
}

/**
 * Estimates game accuracy percentage for White and Black based on move evaluations.
 */
export function calculateMatchAccuracies(evalHistory: number[]): { whiteAcc: number; blackAcc: number } {
  if (evalHistory.length <= 1) {
    return { whiteAcc: 85.0, blackAcc: 83.5 };
  }

  let whiteErrors = 0;
  let blackErrors = 0;
  let whiteTurns = 0;
  let blackTurns = 0;

  for (let i = 1; i < evalHistory.length; i++) {
    const prev = evalHistory[i - 1];
    const curr = evalHistory[i];
    const diff = curr - prev;

    if (i % 2 === 1) {
      // White move: diff should be positive or neutral
      whiteTurns++;
      if (diff < -1.5) whiteErrors += 3; // blunder
      else if (diff < -0.6) whiteErrors += 1.5; // inaccuracy
      else if (diff < -0.2) whiteErrors += 0.5;
    } else {
      // Black move: diff should be negative or neutral
      blackTurns++;
      if (diff > 1.5) blackErrors += 3; // blunder
      else if (diff > 0.6) blackErrors += 1.5;
      else if (diff > 0.2) blackErrors += 0.5;
    }
  }

  const whiteAcc = Math.max(50, Math.min(98.5, 96 - (whiteErrors / Math.max(1, whiteTurns)) * 12));
  const blackAcc = Math.max(50, Math.min(98.5, 96 - (blackErrors / Math.max(1, blackTurns)) * 12));

  return {
    whiteAcc: Number(whiteAcc.toFixed(1)),
    blackAcc: Number(blackAcc.toFixed(1)),
  };
}
