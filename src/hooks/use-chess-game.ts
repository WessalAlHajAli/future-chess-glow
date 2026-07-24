import { Chess, type Move, type Square } from "chess.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { pickAiMoveAsync, type Difficulty } from "../lib/chess-ai";

export type PlayerColor = "w" | "b";

export type GameStatus =
  | "idle"
  | "playing"
  | "check"
  | "checkmate"
  | "stalemate"
  | "draw"
  | "resigned";

export type MoveKind =
  | "move"
  | "capture"
  | "check"
  | "checkmate"
  | null;

export interface GameState {
  fen: string;
  turn: PlayerColor;
  status: GameStatus;
  drawReason: string | null;
  winner: PlayerColor | null;
  history: Move[];
  captured: { w: string[]; b: string[] };
  isThinking: boolean;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  boardFlipped: boolean;
  selected: Square | null;
  legalTargets: Square[];
  lastMove: { from: Square; to: Square } | null;
  lastMoveKind: MoveKind;
  evaluation: number;
  pendingPromotion: { from: Square; to: Square } | null;
  canUndo: boolean;
  canRedo: boolean;
}

function computeCaptured(history: Move[]) {
  const captured: { w: string[]; b: string[] } = { w: [], b: [] };
  for (const m of history) {
    if (m.captured) {
      // The moving color captured an opponent piece.
      captured[m.color].push(m.captured);
    }
  }
  return captured;
}

const PIECE_MATERIAL: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function computeEvaluation(chess: Chess): number {
  let score = 0;
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq) continue;
      const v = PIECE_MATERIAL[sq.type] ?? 0;
      score += sq.color === "w" ? v : -v;
    }
  }
  return score;
}

function statusFrom(
  chess: Chess,
): { status: GameStatus; winner: PlayerColor | null; drawReason: string | null } {
  if (chess.isCheckmate()) {
    return {
      status: "checkmate",
      winner: chess.turn() === "w" ? "b" : "w",
      drawReason: null,
    };
  }
  if (chess.isStalemate())
    return { status: "stalemate", winner: null, drawReason: "Stalemate" };
  if (safe(() => chess.isThreefoldRepetition()))
    return { status: "draw", winner: null, drawReason: "Threefold repetition" };
  if (safe(() => chess.isInsufficientMaterial()))
    return { status: "draw", winner: null, drawReason: "Insufficient material" };
  if (chess.isDraw())
    return { status: "draw", winner: null, drawReason: "Fifty-move rule" };
  if (chess.inCheck()) return { status: "check", winner: null, drawReason: null };
  return { status: "playing", winner: null, drawReason: null };
}

function safe(fn: () => boolean): boolean {
  try {
    return fn();
  } catch {
    return false;
  }
}

function kindOf(mv: Move | null | undefined, chess: Chess): MoveKind {
  if (!mv) return null;
  if (chess.isCheckmate()) return "checkmate";
  if (chess.inCheck()) return "check";
  if (mv.captured) return "capture";
  return "move";
}

export function useChessGame() {
  const chessRef = useRef<Chess>(new Chess());
  const redoStackRef = useRef<Move[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [tick, setTick] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [lastMoveKind, setLastMoveKind] = useState<MoveKind>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [resigned, setResigned] = useState<PlayerColor | null>(null);
  const [agreedDraw, setAgreedDraw] = useState<string | null>(null);

  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const state: GameState = useMemo(() => {
    const chess = chessRef.current;
    const { status, winner, drawReason } = statusFrom(chess);
    const history = chess.history({ verbose: true }) as Move[];
    let finalStatus: GameStatus = status;
    let finalWinner = winner;
    let finalDraw = drawReason;
    if (resigned) {
      finalStatus = "resigned";
      finalWinner = resigned === "w" ? "b" : "w";
    } else if (agreedDraw) {
      finalStatus = "draw";
      finalDraw = agreedDraw;
    }
    let legalTargets: Square[] = [];
    if (selected) {
      legalTargets = (chess.moves({ square: selected, verbose: true }) as Move[]).map(
        (m) => m.to as Square,
      );
    }
    return {
      fen: chess.fen(),
      turn: chess.turn(),
      status: finalStatus,
      drawReason: finalDraw,
      winner: finalWinner,
      history,
      captured: computeCaptured(history),
      isThinking,
      difficulty,
      playerColor,
      boardFlipped,
      selected,
      legalTargets,
      lastMove,
      lastMoveKind,
      evaluation: computeEvaluation(chess),
      pendingPromotion,
      canUndo: history.length > 0 && !isThinking,
      canRedo: redoStackRef.current.length > 0 && !isThinking,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    tick,
    selected,
    isThinking,
    difficulty,
    playerColor,
    boardFlipped,
    lastMove,
    lastMoveKind,
    pendingPromotion,
    resigned,
    agreedDraw,
  ]);

  const applyMove = useCallback(
    (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => {
      const chess = chessRef.current;
      try {
        const mv = chess.move({ from, to, promotion: promotion ?? "q" });
        if (!mv) return null;
        redoStackRef.current = [];
        setLastMove({ from, to });
        setLastMoveKind(kindOf(mv, chess));
        setSelected(null);
        rerender();
        return mv;
      } catch {
        return null;
      }
    },
    [rerender],
  );

  const selectSquare = useCallback(
    (square: Square) => {
      const chess = chessRef.current;
      if (isThinking || resigned) return;
      if (chess.turn() !== playerColor) return;
      const piece = chess.get(square);

      if (selected) {
        const legal = chess.moves({ square: selected, verbose: true }) as Move[];
        const match = legal.find((m) => m.to === square);
        if (match) {
          const isPromotion =
            match.piece === "p" && (square[1] === "8" || square[1] === "1");
          if (isPromotion) {
            setPendingPromotion({ from: selected, to: square });
            return;
          }
          applyMove(selected, square);
          return;
        }
        // Reselect if clicking own piece
        if (piece && piece.color === playerColor) {
          setSelected(square);
          return;
        }
        setSelected(null);
        return;
      }

      if (piece && piece.color === playerColor) {
        setSelected(square);
      }
    },
    [applyMove, isThinking, playerColor, resigned, selected],
  );

  const finishPromotion = useCallback(
    (piece: "q" | "r" | "b" | "n") => {
      if (!pendingPromotion) return;
      applyMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    },
    [applyMove, pendingPromotion],
  );

  // AI turn effect
  useEffect(() => {
    const chess = chessRef.current;
    if (resigned || agreedDraw) return;
    if (chess.isGameOver()) return;
    if (chess.turn() === playerColor) return;
    if (pendingPromotion) return;
    let cancelled = false;
    setIsThinking(true);
    (async () => {
      const mv = await pickAiMoveAsync(chess.fen(), difficulty);
      if (cancelled || !mv) {
        setIsThinking(false);
        return;
      }
      try {
        const applied = chess.move(mv);
        setLastMove({ from: mv.from as Square, to: mv.to as Square });
        setLastMoveKind(kindOf(applied, chess));
        redoStackRef.current = [];
      } catch {
        /* noop */
      }
      setIsThinking(false);
      rerender();
    })();
    return () => {
      cancelled = true;
    };
  }, [tick, playerColor, difficulty, pendingPromotion, resigned, agreedDraw, rerender]);

  const newGame = useCallback(
    (opts?: { playerColor?: PlayerColor; difficulty?: Difficulty }) => {
      chessRef.current = new Chess();
      redoStackRef.current = [];
      if (opts?.playerColor) setPlayerColor(opts.playerColor);
      if (opts?.difficulty) setDifficulty(opts.difficulty);
      setSelected(null);
      setLastMove(null);
      setLastMoveKind(null);
      setPendingPromotion(null);
      setResigned(null);
      setAgreedDraw(null);
      setIsThinking(false);
      setBoardFlipped(false);
      rerender();
    },
    [rerender],
  );

  const restart = useCallback(() => {
    newGame({ playerColor, difficulty });
  }, [newGame, playerColor, difficulty]);

  const undo = useCallback(() => {
    const chess = chessRef.current;
    if (isThinking) return;
    // Undo one half-move; if it's now the AI's turn (i.e. we undid the AI's reply),
    // undo one more so control returns to the player.
    const first = chess.undo() as Move | null;
    if (!first) return;
    redoStackRef.current.push(first);
    if (chess.history().length > 0 && chess.turn() !== playerColor) {
      const second = chess.undo() as Move | null;
      if (second) redoStackRef.current.push(second);
    }
    setSelected(null);
    const last = chess.history({ verbose: true }).slice(-1)[0] as Move | undefined;
    setLastMove(last ? { from: last.from as Square, to: last.to as Square } : null);
    setLastMoveKind(kindOf(last, chess));
    setPendingPromotion(null);
    setAgreedDraw(null);
    setResigned(null);
    rerender();
  }, [isThinking, playerColor, rerender]);

  const redo = useCallback(() => {
    const chess = chessRef.current;
    if (isThinking) return;
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    let last: Move | null = null;
    // Replay up to two half-moves so both sides move forward, mirroring undo.
    for (let i = 0; i < 2 && stack.length > 0; i++) {
      const mv = stack.pop()!;
      const applied = chess.move({
        from: mv.from,
        to: mv.to,
        promotion: mv.promotion,
      });
      if (!applied) break;
      last = applied;
      if (chess.turn() === playerColor) break;
    }
    if (last) {
      setLastMove({ from: last.from as Square, to: last.to as Square });
      setLastMoveKind(kindOf(last, chess));
    }
    rerender();
  }, [isThinking, playerColor, rerender]);

  const flipBoard = useCallback(() => setBoardFlipped((f) => !f), []);

  const resign = useCallback(() => {
    setResigned(playerColor);
    rerender();
  }, [playerColor, rerender]);

  const offerDraw = useCallback(() => {
    const chess = chessRef.current;
    if (chess.isStalemate()) {
      setAgreedDraw("Stalemate");
    } else if (safe(() => chess.isThreefoldRepetition())) {
      setAgreedDraw("Threefold repetition");
    } else if (safe(() => chess.isInsufficientMaterial())) {
      setAgreedDraw("Insufficient material");
    } else if (chess.isDraw()) {
      setAgreedDraw("Fifty-move rule");
    } else {
      setAgreedDraw("Draw by agreement");
    }
    rerender();
  }, [rerender]);

  const hint = useCallback(async (): Promise<{ from: Square; to: Square } | null> => {
    const chess = chessRef.current;
    if (chess.turn() !== playerColor || chess.isGameOver()) return null;
    const mv = await pickAiMoveAsync(chess.fen(), "expert");
    if (!mv) return null;
    return { from: mv.from as Square, to: mv.to as Square };
  }, [playerColor]);

  const exportPgn = useCallback(() => chessRef.current.pgn(), []);
  const exportFen = useCallback(() => chessRef.current.fen(), []);

  const loadPgn = useCallback(
    (pgn: string): { ok: boolean; error?: string } => {
      const chess = new Chess();
      try {
        chess.loadPgn(pgn);
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Invalid PGN" };
      }
      chessRef.current = chess;
      redoStackRef.current = [];
      const last = chess.history({ verbose: true }).slice(-1)[0] as Move | undefined;
      setLastMove(last ? { from: last.from as Square, to: last.to as Square } : null);
      setLastMoveKind(kindOf(last, chess));
      setSelected(null);
      setPendingPromotion(null);
      setResigned(null);
      setAgreedDraw(null);
      setIsThinking(false);
      rerender();
      return { ok: true };
    },
    [rerender],
  );

  const loadFen = useCallback(
    (fen: string): { ok: boolean; error?: string } => {
      try {
        const chess = new Chess(fen);
        chessRef.current = chess;
        redoStackRef.current = [];
        setLastMove(null);
        setLastMoveKind(null);
        setSelected(null);
        setPendingPromotion(null);
        setResigned(null);
        setAgreedDraw(null);
        setIsThinking(false);
        rerender();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Invalid FEN" };
      }
    },
    [rerender],
  );

  const changeDifficulty = useCallback((d: Difficulty) => setDifficulty(d), []);

  return {
    state,
    selectSquare,
    newGame,
    restart,
    undo,
    redo,
    flipBoard,
    resign,
    offerDraw,
    hint,
    finishPromotion,
    cancelPromotion: () => setPendingPromotion(null),
    setDifficulty: changeDifficulty,
    setPlayerColor,
    exportPgn,
    exportFen,
    loadPgn,
    loadFen,
  };
}