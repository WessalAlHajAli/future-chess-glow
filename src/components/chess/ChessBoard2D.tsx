import { useMemo } from "react";
import { Chess, type Square } from "chess.js";
import { Chessboard } from "react-chessboard";

import type { GameState } from "../../hooks/use-chess-game";
import {
  BOARD_COLORS,
  animationDurationMs,
  type Preferences,
} from "../../lib/chess-preferences";

interface Props {
  state: GameState;
  onSquareClick: (square: Square) => void;
  prefs: Preferences;
}

function findKingSquare(fen: string, color: "w" | "b"): Square | null {
  const chess = new Chess(fen);
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (cell && cell.type === "k" && cell.color === color) {
        return (String.fromCharCode(97 + f) + (8 - r).toString()) as Square;
      }
    }
  }
  return null;
}

export function ChessBoard2D({ state, onSquareClick, prefs }: Props) {
  const checkSquare = useMemo<Square | null>(() => {
    if (state.status !== "check" && state.status !== "checkmate") return null;
    return findKingSquare(state.fen, state.turn);
  }, [state.fen, state.status, state.turn]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (state.lastMove && prefs.highlightMoves) {
      const hi = "inset 0 0 0 9999px rgba(242, 180, 92, 0.28)";
      styles[state.lastMove.from] = { boxShadow: hi };
      styles[state.lastMove.to] = { boxShadow: hi };
    }
    if (state.selected) {
      styles[state.selected] = {
        boxShadow:
          "inset 0 0 0 3px rgba(242, 180, 92, 0.9), inset 0 0 24px rgba(242, 180, 92, 0.35)",
      };
    }
    if (prefs.showLegalMoves) {
      for (const sq of state.legalTargets) {
        const isCapture = new Chess(state.fen).get(sq as Square);
        styles[sq] = isCapture
          ? {
              background:
                "radial-gradient(circle, transparent 55%, rgba(242,180,92,0.55) 58%, rgba(242,180,92,0.55) 68%, transparent 71%)",
            }
          : {
              background:
                "radial-gradient(circle, rgba(242,180,92,0.55) 22%, transparent 24%)",
            };
      }
    }
    if (checkSquare) {
      styles[checkSquare] = {
        boxShadow:
          "inset 0 0 0 3px rgba(220, 60, 60, 0.9), inset 0 0 30px rgba(220, 40, 40, 0.55)",
      };
    }
    return styles;
  }, [
    state.selected,
    state.legalTargets,
    state.lastMove,
    state.fen,
    checkSquare,
    prefs.highlightMoves,
    prefs.showLegalMoves,
  ]);

  const boardColors = BOARD_COLORS[prefs.boardColor];
  const baseOrientation: "w" | "b" =
    prefs.boardOrientation === "auto"
      ? state.playerColor
      : prefs.boardOrientation === "white"
        ? "w"
        : "b";
  const orientation: "white" | "black" = state.boardFlipped
    ? baseOrientation === "w"
      ? "black"
      : "white"
    : baseOrientation === "w"
      ? "white"
      : "black";
  const animMs = animationDurationMs(prefs.animationSpeed);

  return (
    <div className="chess-frame relative mx-auto w-full">
      <div className="chess-frame-inner">
        <Chessboard
          options={{
            position: state.fen,
            boardOrientation: orientation,
            animationDurationInMs: animMs,
            showAnimations: animMs > 0,
            allowDragging: false,
            showNotation: prefs.showCoordinates,
            onSquareClick: ({ square }) => onSquareClick(square as Square),
            onPieceClick: ({ square }) => onSquareClick(square as Square),
            squareStyles,
            darkSquareStyle: { backgroundColor: boardColors.dark },
            lightSquareStyle: { backgroundColor: boardColors.light },
            boardStyle: {
              borderRadius: "6px",
              overflow: "hidden",
              boxShadow:
                "inset 0 0 0 1px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.55)",
            },
            darkSquareNotationStyle: { color: "rgba(233,220,192,0.55)" },
            lightSquareNotationStyle: { color: "rgba(60,45,25,0.65)" },
          }}
        />
      </div>
    </div>
  );
}