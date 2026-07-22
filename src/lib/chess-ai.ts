import { Chess, type Move } from "chess.js";

export type Difficulty = "easy" | "medium" | "hard" | "master";

// Simple material values for evaluation.
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-square tables (from white's perspective, a1 = index 0 conceptually
// but chess.js gives squares like "e4"; we compute a rank/file index).
const PST_PAWN = [
  0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0,
  -10, -5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10,
  20, 30, 30, 20, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0, 0, 0,
  0,
];
const PST_KNIGHT = [
  -50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30,
  5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20,
  20, 15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20,
  -40, -50, -40, -30, -30, -30, -30, -40, -50,
];

function squareIndex(square: string): number {
  const file = square.charCodeAt(0) - 97; // a=0
  const rank = parseInt(square[1], 10) - 1; // 1=0
  return rank * 8 + file;
}

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const val = PIECE_VALUES[sq.type] ?? 0;
      let pst = 0;
      const idx = (7 - r) * 8 + f; // white perspective
      const whiteIdx = sq.color === "w" ? idx : 63 - idx;
      if (sq.type === "p") pst = PST_PAWN[whiteIdx];
      else if (sq.type === "n") pst = PST_KNIGHT[whiteIdx];
      const total = val + pst;
      score += sq.color === "w" ? total : -total;
    }
  }
  return score;
}

function orderMoves(chess: Chess, moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const scoreA = (a.captured ? PIECE_VALUES[a.captured] : 0) + (a.promotion ? 800 : 0);
    const scoreB = (b.captured ? PIECE_VALUES[b.captured] : 0) + (b.promotion ? 800 : 0);
    return scoreB - scoreA;
  });
}

function negamax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  color: 1 | -1,
): number {
  if (depth === 0 || chess.isGameOver()) {
    return color * evaluateBoard(chess);
  }
  const moves = orderMoves(chess, chess.moves({ verbose: true }) as Move[]);
  let best = -Infinity;
  for (const mv of moves) {
    chess.move(mv);
    const score = -negamax(chess, depth - 1, -beta, -alpha, color === 1 ? -1 : 1);
    chess.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function depthFor(difficulty: Difficulty): number {
  switch (difficulty) {
    case "easy":
      return 1;
    case "medium":
      return 2;
    case "hard":
      return 3;
    case "master":
      return 4;
  }
}

function randomness(difficulty: Difficulty): number {
  // Probability of picking a random legal move instead of best move.
  switch (difficulty) {
    case "easy":
      return 0.7;
    case "medium":
      return 0.25;
    case "hard":
      return 0.05;
    case "master":
      return 0;
  }
}

/**
 * Modular AI entry point. Returns a legal move in SAN form.
 * Runs synchronously but is wrapped by callers in `setTimeout` / worker
 * boundaries so the UI stays responsive. A future Stockfish integration can
 * replace this function without touching the game hook.
 */
export function pickAiMove(fen: string, difficulty: Difficulty): Move | null {
  const chess = new Chess(fen);
  const legal = chess.moves({ verbose: true }) as Move[];
  if (legal.length === 0) return null;

  if (Math.random() < randomness(difficulty)) {
    return legal[Math.floor(Math.random() * legal.length)];
  }

  const depth = depthFor(difficulty);
  const color: 1 | -1 = chess.turn() === "w" ? 1 : -1;
  let best = legal[0];
  let bestScore = -Infinity;
  const ordered = orderMoves(chess, legal);
  for (const mv of ordered) {
    chess.move(mv);
    const score = -negamax(chess, depth - 1, -Infinity, Infinity, color === 1 ? -1 : 1);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      best = mv;
    }
  }
  return best;
}

export async function pickAiMoveAsync(
  fen: string,
  difficulty: Difficulty,
): Promise<Move | null> {
  // Yield to the event loop so the UI can paint a "thinking" indicator.
  await new Promise((r) => setTimeout(r, 30));
  return pickAiMove(fen, difficulty);
}