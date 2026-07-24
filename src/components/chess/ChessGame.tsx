import { useState } from "react";
import { toast } from "sonner";
import { Menu } from "lucide-react";

import { useChessGame } from "../../hooks/use-chess-game";
import { ChessBoard2D } from "./ChessBoard2D";
import { PlayerPanel } from "./PlayerPanel";
import { MoveHistory } from "./MoveHistory";
import { CapturedPieces } from "./CapturedPieces";
import { EvaluationBar } from "./EvaluationBar";
import { GameControls } from "./GameControls";
import { SettingsModal } from "./SettingsModal";
import { PromotionDialog } from "./PromotionDialog";
import { GameOverBanner } from "./GameOverBanner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";

function statusLabel(status: string, turn: "w" | "b", playerColor: "w" | "b") {
  if (status === "check") return "Check!";
  if (status === "checkmate") return "Checkmate";
  if (status === "stalemate") return "Stalemate";
  if (status === "draw") return "Draw";
  if (status === "resigned") return "Resigned";
  return turn === playerColor ? "Your turn" : "AI's turn";
}

export function ChessGame() {
  const {
    state,
    selectSquare,
    newGame,
    undo,
    resign,
    hint,
    finishPromotion,
    cancelPromotion,
    setDifficulty,
    setPlayerColor,
  } = useChessGame();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState(state.difficulty);
  const [pendingColor, setPendingColor] = useState(state.playerColor);

  const openSettings = () => {
    setPendingDifficulty(state.difficulty);
    setPendingColor(state.playerColor);
    setSettingsOpen(true);
  };

  const applySettings = () => {
    setSettingsOpen(false);
    newGame({ difficulty: pendingDifficulty, playerColor: pendingColor });
    toast.success("New game started");
  };

  const showHint = async () => {
    const mv = await hint();
    if (mv) {
      toast(`Hint: ${mv.from} \u2192 ${mv.to}`);
    }
  };

  const handleResign = () => {
    resign();
    toast.error("You resigned.");
  };

  const playerName = "You";
  const aiName = `AI \u00b7 ${state.difficulty}`;
  const playerTurn = state.turn === state.playerColor;

  const sidePanels = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Difficulty
        </p>
        <p className="mt-1 text-lg font-semibold capitalize text-foreground">
          {state.difficulty}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          Status
        </p>
        <p className="mt-1 text-sm text-foreground">
          {statusLabel(state.status, state.turn, state.playerColor)}
        </p>
      </div>
      <MoveHistory moves={state.history} />
      <CapturedPieces captured={state.captured} />
      <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
        <EvaluationBar score={state.evaluation} />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen w-full">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-4 px-3 py-4 sm:px-6 sm:py-6 lg:grid lg:grid-cols-[280px_minmax(0,1fr)_280px] lg:gap-6">
        {/* Mobile header */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 lg:hidden">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold tracking-tight text-foreground text-glow">
              Amber Chess
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {statusLabel(state.status, state.turn, state.playerColor)}
            </p>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open game panels">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[86vw] max-w-sm overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Game Info</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{sidePanels}</div>
            </SheetContent>
          </Sheet>
        </header>

        <aside className="hidden flex-col gap-4 lg:flex">
          <PlayerPanel
            side={state.playerColor === "w" ? "player" : "ai"}
            name={state.playerColor === "w" ? playerName : aiName}
            subtitle="ELO 1200"
            isTurn={state.turn === "w"}
            isThinking={state.isThinking && state.turn === "w" && state.playerColor === "b"}
          />
          {sidePanels}
        </aside>

        <main className="flex min-w-0 flex-col items-center justify-start gap-3">
          <div className="w-full lg:hidden">
            <PlayerPanel
              side="ai"
              name={aiName}
              subtitle={`Level: ${state.difficulty}`}
              isTurn={!playerTurn}
              isThinking={state.isThinking}
            />
          </div>

          <div className="relative w-full">
            <div className="mx-auto w-full max-w-[min(88vh,720px)]">
              <ChessBoard2D state={state} onSquareClick={selectSquare} />
            </div>
            <GameOverBanner
              state={state}
              onNewGame={() =>
                newGame({ difficulty: state.difficulty, playerColor: state.playerColor })
              }
            />
          </div>

          <div className="w-full lg:hidden">
            <PlayerPanel
              side="player"
              name={playerName}
              subtitle="ELO 1200"
              isTurn={playerTurn}
            />
          </div>

          <div className="w-full">
            <GameControls
              onNewGame={() =>
                newGame({ difficulty: state.difficulty, playerColor: state.playerColor })
              }
              onUndo={undo}
              onHint={showHint}
              onSettings={openSettings}
              onResign={handleResign}
              disabled={state.isThinking}
            />
          </div>
        </main>

        <aside className="hidden flex-col gap-4 lg:flex">
          <PlayerPanel
            side={state.playerColor === "w" ? "ai" : "player"}
            name={state.playerColor === "w" ? aiName : playerName}
            subtitle={`Level: ${state.difficulty}`}
            isTurn={state.turn === "b"}
            isThinking={state.isThinking && state.turn === "b"}
          />
          <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Game Info</h3>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>
                Moves played: {" "}
                <span className="font-mono text-foreground">{state.history.length}</span>
              </li>
              <li>
                Turn: {" "}
                <span className="font-mono text-foreground">
                  {state.turn === "w" ? "White" : "Black"}
                </span>
              </li>
              <li>
                Difficulty: {" "}
                <span className="capitalize text-foreground">{state.difficulty}</span>
              </li>
            </ul>
          </div>
          <div className="mt-auto rounded-2xl border border-border bg-card/60 p-4 text-xs text-muted-foreground backdrop-blur-sm">
            Click a piece to select it. Highlighted circles show legal squares.
          </div>
        </aside>
      </div>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        difficulty={pendingDifficulty}
        playerColor={pendingColor}
        onChangeDifficulty={(d) => {
          setPendingDifficulty(d);
          setDifficulty(d);
        }}
        onChangePlayerColor={(c) => {
          setPendingColor(c);
          setPlayerColor(c);
        }}
        onApplyAndNewGame={applySettings}
      />

      <PromotionDialog
        open={!!state.pendingPromotion}
        color={state.playerColor}
        onSelect={finishPromotion}
        onCancel={cancelPromotion}
      />
    </div>
  );
}