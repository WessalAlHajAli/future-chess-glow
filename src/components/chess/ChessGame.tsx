import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Menu, Settings as SettingsIcon } from "lucide-react";

import { useChessGame } from "../../hooks/use-chess-game";
import { useChessPreferences } from "../../hooks/use-chess-preferences";
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
import { SaveLoadDialog } from "./SaveLoadDialog";
import { DIFFICULTY_ELO, DIFFICULTY_LABELS } from "../../lib/chess-ai";
import { setSoundsEnabled, sounds } from "../../lib/chess-sounds";
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
    restart,
    undo,
    redo,
    flipBoard,
    resign,
    offerDraw,
    hint,
    finishPromotion,
    cancelPromotion,
    setDifficulty,
    setPlayerColor,
    exportPgn,
    exportFen,
    loadPgn,
    loadFen,
  } = useChessGame();
  const { prefs, update: updatePref } = useChessPreferences();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saveLoadOpen, setSaveLoadOpen] = useState(false);
  const [pendingDifficulty, setPendingDifficulty] = useState(state.difficulty);
  const [pendingColor, setPendingColor] = useState(state.playerColor);

  // Keep sound engine flag in sync with preference.
  useEffect(() => {
    setSoundsEnabled(prefs.soundsEnabled);
  }, [prefs.soundsEnabled]);

  // Play sound effect when a move is applied or game state changes.
  const lastAnnouncedRef = useRef<{ len: number; kind: string | null }>({
    len: 0,
    kind: null,
  });
  useEffect(() => {
    const len = state.history.length;
    const kind = state.lastMoveKind;
    if (len === lastAnnouncedRef.current.len) return;
    lastAnnouncedRef.current = { len, kind };
    if (state.status === "checkmate") sounds.checkmate();
    else if (kind === "check") sounds.check();
    else if (kind === "capture") sounds.capture();
    else if (kind === "move") sounds.move();
  }, [state.history.length, state.lastMoveKind, state.status]);

  const openSettings = () => {
    setPendingDifficulty(state.difficulty);
    setPendingColor(state.playerColor);
    setSettingsOpen(true);
  };

  const applySettings = () => {
    setSettingsOpen(false);
    newGame({ difficulty: pendingDifficulty, playerColor: pendingColor });
    toast.success("New game started");
    sounds.gameStart();
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

  const handleOfferDraw = () => {
    offerDraw();
    toast("Draw agreed.");
  };

  const handleNewGame = () => {
    newGame({ difficulty: state.difficulty, playerColor: state.playerColor });
    sounds.gameStart();
  };

  const handleRestart = () => {
    restart();
    sounds.gameStart();
  };

  const handleDifficultyChange = (d: typeof state.difficulty) => {
    setDifficulty(d);
    toast(`Difficulty: ${DIFFICULTY_LABELS[d]}`);
  };

  const playerName = "You";
  const aiName = "AI Mentor";
  const aiElo = DIFFICULTY_ELO[state.difficulty];
  const playerTurn = state.turn === state.playerColor;
  const isAiThinking = state.isThinking && !playerTurn;

  const turnPill = (
    <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/40 bg-black/50 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-primary animate-fade-in">
      <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.9)]" />
      {state.drawReason && state.status === "draw"
        ? `Draw: ${state.drawReason}`
        : statusLabel(state.status, state.turn, state.playerColor)}
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
        subtitle={`ELO ${aiElo}`}
        isTurn={!playerTurn}
        isThinking={isAiThinking}
        clock="10:00"
      />
      <DifficultyBar difficulty={state.difficulty} onChange={handleDifficultyChange} />
      <CapturedPieces captured={state.captured} />
      <MoveHistory moves={state.history} />
      <EvaluationBar score={state.evaluation} />
    </div>
  );

  const controlBar = (
    <GameControls
      onNewGame={handleNewGame}
      onRestart={handleRestart}
      onUndo={undo}
      onRedo={redo}
      onHint={showHint}
      onSettings={openSettings}
      onResign={handleResign}
      onFlip={flipBoard}
      onSaveLoad={() => setSaveLoadOpen(true)}
      onOfferDraw={handleOfferDraw}
      canUndo={state.canUndo}
      canRedo={state.canRedo}
      disabled={state.isThinking}
    />
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
                className="grid h-11 w-11 place-items-center rounded-full border border-primary/30 bg-black/40 text-primary/85 transition hover:border-primary/70 hover:text-primary xl:hidden"
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
          <div className="hidden h-11 w-11 xl:block" />
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

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-start xl:grid-cols-[300px_minmax(0,1fr)_320px] 2xl:grid-cols-[320px_minmax(0,1fr)_340px]">
          {/* Desktop (xl+) left column */}
          <aside className="hidden xl:block">{leftColumn}</aside>

          {/* Board */}
          <main className="flex min-w-0 flex-col items-center gap-6">
            {/* Mobile / tablet AI card above board */}
            <div className="w-full xl:hidden">
              <PlayerPanel
                side="ai"
                name={aiName}
                subtitle={`ELO ${aiElo}`}
                isTurn={!playerTurn}
                isThinking={isAiThinking}
                clock="10:00"
              />
            </div>

            <div className="relative w-full animate-scale-in">
              <div className="mx-auto w-full max-w-[min(82vh,720px)]">
                <ChessBoard2D state={state} onSquareClick={selectSquare} prefs={prefs} />
              </div>
              <GameOverBanner
                state={state}
                onNewGame={() =>
                  newGame({ difficulty: state.difficulty, playerColor: state.playerColor })
                }
              />
            </div>

            <div className="xl:hidden">{turnPill}</div>

            {/* Mobile / tablet player card below board */}
            <div className="w-full xl:hidden">
              <PlayerPanel
                side="player"
                name={playerName}
                subtitle="ELO 1450"
                isTurn={playerTurn}
                clock="09:45"
              />
            </div>

            <div className="w-full max-w-4xl">{controlBar}</div>

            <Tagline />
          </main>

          {/* Tablet (md-lg) right column */}
          <aside className="hidden md:flex md:flex-col md:gap-4 xl:hidden">
            <DifficultyBar difficulty={state.difficulty} onChange={handleDifficultyChange} />
            <GameInfoPanel state={state} />
            <CapturedPieces captured={state.captured} />
            <MoveHistory moves={state.history} />
            <EvaluationBar score={state.evaluation} />
          </aside>

          {/* Desktop (xl+) right column */}
          <aside className="hidden xl:block">{rightColumn}</aside>

          {/* Mobile stacked right-column panels */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden">
            <DifficultyBar difficulty={state.difficulty} onChange={handleDifficultyChange} />
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
        prefs={prefs}
        onChangeDifficulty={(d) => {
          setPendingDifficulty(d);
          setDifficulty(d);
        }}
        onChangePlayerColor={(c) => {
          setPendingColor(c);
          setPlayerColor(c);
        }}
        onChangePref={updatePref}
        onApplyAndNewGame={applySettings}
      />

      <SaveLoadDialog
        open={saveLoadOpen}
        onOpenChange={setSaveLoadOpen}
        pgn={exportPgn()}
        fen={exportFen()}
        onLoadPgn={loadPgn}
        onLoadFen={loadFen}
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