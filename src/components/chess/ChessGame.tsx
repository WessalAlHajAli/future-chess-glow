import { useState } from "react";
import { toast } from "sonner";
import { Menu, Settings as SettingsIcon } from "lucide-react";

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
import { Header, Tagline } from "./Header";
import { GameInfoPanel } from "./GameInfoPanel";
import { DifficultyBar } from "./DifficultyBar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

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
  const aiName = "AI Mentor";
  const playerTurn = state.turn === state.playerColor;
  const isAiThinking = state.isThinking && !playerTurn;

  const turnPill = (
    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
      <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.9)]" />
      {statusLabel(state.status, state.turn, state.playerColor)}
    </div>
  );

  const leftColumn = (
    <div className="flex flex-col gap-4">
      <PlayerPanel
        side="player"
        name={playerName}
        subtitle="ELO 1450"
        isTurn={playerTurn}
        clock="09:45"
      />
      {turnPill}
      <GameInfoPanel state={state} />
    </div>
  );

  const rightColumn = (
    <div className="flex flex-col gap-4">
      <PlayerPanel
        side="ai"
        name={aiName}
        subtitle="ELO 2000"
        isTurn={!playerTurn}
        isThinking={isAiThinking}
        clock="10:00"
      />
      <DifficultyBar difficulty={state.difficulty} />
      <CapturedPieces captured={state.captured} />
      <MoveHistory moves={state.history} />
      <EvaluationBar score={state.evaluation} />
    </div>
  );

  return (
    <div className="relative min-h-screen w-full">
      <div className="mx-auto flex min-h-screen max-w-[1500px] flex-col gap-6 px-3 py-5 sm:px-6 sm:py-8 lg:px-10">
        {/* Top bar with menu / header / settings */}
        <header className="relative flex items-center justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-black/40 text-primary/85 transition hover:border-primary/70 hover:text-primary lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm overflow-y-auto bg-background">
              <SheetHeader>
                <SheetTitle className="font-serif tracking-widest">Game</SheetTitle>
              </SheetHeader>
              <div className="mt-6">{leftColumn}</div>
            </SheetContent>
          </Sheet>
          <div className="hidden h-11 w-11 lg:block" />
          <Header />
          <button
            type="button"
            aria-label="Open settings"
            onClick={openSettings}
            className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-black/40 text-primary/85 transition hover:border-primary/70 hover:text-primary"
          >
            <SettingsIcon className="h-5 w-5" />
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)_320px] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          {/* Desktop left column */}
          <aside className="hidden lg:block">{leftColumn}</aside>

          {/* Board */}
          <main className="flex min-w-0 flex-col items-center gap-6">
            {/* Mobile / tablet AI card above board */}
            <div className="w-full lg:hidden">
              <PlayerPanel
                side="ai"
                name={aiName}
                subtitle="ELO 2000"
                isTurn={!playerTurn}
                isThinking={isAiThinking}
                clock="10:00"
              />
            </div>

            <div className="relative w-full animate-scale-in">
              <div className="mx-auto w-full max-w-[min(82vh,720px)]">
                <ChessBoard2D state={state} onSquareClick={selectSquare} />
              </div>
              <GameOverBanner
                state={state}
                onNewGame={() =>
                  newGame({ difficulty: state.difficulty, playerColor: state.playerColor })
                }
              />
            </div>

            <div className="lg:hidden">{turnPill}</div>

            {/* Mobile / tablet player card below board */}
            <div className="w-full lg:hidden">
              <PlayerPanel
                side="player"
                name={playerName}
                subtitle="ELO 1450"
                isTurn={playerTurn}
                clock="09:45"
              />
            </div>

            <div className="w-full max-w-3xl">
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

            <Tagline />
          </main>

          {/* Desktop right column */}
          <aside className="hidden lg:block">{rightColumn}</aside>

          {/* Mobile / tablet stacked right-column panels */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            <DifficultyBar difficulty={state.difficulty} />
            <GameInfoPanel state={state} />
            <CapturedPieces captured={state.captured} />
            <MoveHistory moves={state.history} />
            <div className="sm:col-span-2">
              <EvaluationBar score={state.evaluation} />
            </div>
          </div>
        </div>
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