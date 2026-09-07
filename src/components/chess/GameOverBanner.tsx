import { Trophy, Handshake, Flag, Timer } from "lucide-react";

import type { GameState } from "../../hooks/use-chess-game";
import { Button } from "../ui/button";

interface Props {
  state: GameState;
  onNewGame: () => void;
}

export function GameOverBanner({ state, onNewGame }: Props) {
  if (
    state.status !== "checkmate" &&
    state.status !== "stalemate" &&
    state.status !== "draw" &&
    state.status !== "resigned" &&
    state.status !== "timeout"
  ) {
    return null;
  }
  const playerWon = state.winner === state.playerColor;
  const isDraw = state.status === "stalemate" || state.status === "draw";

  let Icon = Trophy;
  let title = "";
  let subtitle = "";
  if (isDraw) {
    Icon = Handshake;
    title = state.status === "stalemate" ? "Stalemate" : "Draw";
    subtitle = "The game is a draw.";
  } else if (state.status === "timeout") {
    Icon = Timer;
    title = playerWon ? "AI ran out of time — you win!" : "Out of time — AI wins";
    subtitle = playerWon ? "The clock decided it." : "Your clock hit zero.";
  } else if (state.status === "resigned") {
    Icon = Flag;
    title = "Resigned";
    subtitle = "You resigned the game.";
  } else {
    title = playerWon ? "Checkmate — you win!" : "Checkmate — AI wins";
    subtitle = playerWon ? "Well played." : "Better luck next time.";
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <div className="mx-4 max-w-sm rounded-2xl border border-primary/40 bg-card p-6 text-center amber-glow">
        <Icon className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-3 text-xl font-bold text-foreground text-glow">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <Button onClick={onNewGame} className="mt-5 w-full">
          New Game
        </Button>
      </div>
    </div>
  );
}