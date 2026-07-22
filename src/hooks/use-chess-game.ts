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

export interface GameState {
  fen: string;
  turn: PlayerColor;
  status: GameStatus;
  winner: PlayerColor | null;
  history: Move[];
  captured: { w: string[]; b: string[] }; // pieces captured BY that color
  isThinking: boolean;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  selected: Square | null;
  legalTargets: Square[];
  lastMove: { from: Square; to: Square } | null;
  evaluation: number; // material diff, positive = white ahead
  pendingPromotion: { from: Square; to: Square } | null;
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

function statusFrom(chess: Chess): { status: GameStatus; winner: PlayerColor | null } {
  if (chess.isCheckmate()) {
    return { status: "checkmate", winner: chess.turn() === "w" ? "b" : "w" };
  }
  if (chess.isStalemate()) return { status: "stalemate", winner: null };
  if (chess.isDraw()) return { status: "draw", winner: null };
  if (chess.inCheck()) return { status: "check", winner: null };
  return { status: "playing", winner: null };
}

export function useChessGame() {
  const chessRef = useRef<Chess>(new Chess());
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [playerColor, setPlayerColor] = useState<PlayerColor>("w");
  const [tick, setTick] = useState(0); // force re-render
  const [selected, setSelected] = useState<Square | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [resigned, setResigned] = useState<PlayerColor | null>(null);

  const rerender = useCallback(() => setTick((t) => t + 1), []);

  const state: GameState = useMemo(() => {
    const chess = chessRef.current;
    const { status, winner } = statusFrom(chess);
    const history = chess.history({ verbose: true }) as Move[];
    let finalStatus: GameStatus = status;
    let finalWinner = winner;
    if (resigned) {
      finalStatus = "resigned";
      finalWinner = resigned === "w" ? "b" : "w";
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
      winner: finalWinner,
      history,
      captured: computeCaptured(history),
      isThinking,
      difficulty,
      playerColor,
      selected,
      legalTargets,
      lastMove,
      evaluation: computeEvaluation(chess),
      pendingPromotion,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, selected, isThinking, difficulty, playerColor, lastMove, pendingPromotion, resigned]);

  const applyMove = useCallback(
    (from: Square, to: Square, promotion?: "q" | "r" | "b" | "n") => {
      const chess = chessRef.current;
      try {
        const mv = chess.move({ from, to, promotion: promotion ?? "q" });
        if (!mv) return null;
        setLastMove({ from, to });
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
    if (resigned) return;
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
        chess.move(mv);
        setLastMove({ from: mv.from as Square, to: mv.to as Square });
      } catch {
        /* noop */
      }
      setIsThinking(false);
      rerender();
    })();
    return () => {
      cancelled = true;
    };
  }, [tick, playerColor, difficulty, pendingPromotion, resigned, rerender]);

  const newGame = useCallback(
    (opts?: { playerColor?: PlayerColor; difficulty?: Difficulty }) => {
      chessRef.current = new Chess();
      if (opts?.playerColor) setPlayerColor(opts.playerColor);
      if (opts?.difficulty) setDifficulty(opts.difficulty);
      setSelected(null);
      setLastMove(null);
      setPendingPromotion(null);
      setResigned(null);
      setIsThinking(false);
      rerender();
    },
    [rerender],
  );

  const undo = useCallback(() => {
    const chess = chessRef.current;
    if (isThinking) return;
    // Undo one player move + one AI move (if it exists)
    const first = chess.undo();
    if (chess.history().length > 0 && first) {
      chess.undo();
    }
    setSelected(null);
    setLastMove(null);
    setPendingPromotion(null);
    rerender();
  }, [isThinking, rerender]);

  const resign = useCallback(() => {
    setResigned(playerColor);
    rerender();
  }, [playerColor, rerender]);

  const hint = useCallback(async (): Promise<{ from: Square; to: Square } | null> => {
    const chess = chessRef.current;
    if (chess.turn() !== playerColor || chess.isGameOver()) return null;
    const mv = await pickAiMoveAsync(chess.fen(), "hard");
    if (!mv) return null;
    return { from: mv.from as Square, to: mv.to as Square };
  }, [playerColor]);

  return {
    state,
    selectSquare,
    newGame,
    undo,
    resign,
    hint,
    finishPromotion,
    cancelPromotion: () => setPendingPromotion(null),
    setDifficulty,
    setPlayerColor,
  };
}