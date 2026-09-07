import type { GameState } from "../../hooks/use-chess-game";

interface Props {
  state: GameState;
  /** When false, live turn/move rows are hidden (used in the side menu). */
  showLive?: boolean;
}

export function GameInfoPanel({ state, showLive = true }: Props) {
  const moveNumber = Math.floor(state.history.length / 2) + 1;
  const lastSan = state.history[state.history.length - 1]?.san ?? "—";
  return (
    <div className="panel animate-fade-in p-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">
        Game Info
      </p>
      <dl className="space-y-2 text-sm">
        <Row label="Mode" value="AI Match" />
        <Row label="Difficulty" value={<span className="capitalize">{state.difficulty}</span>} />
        {showLive && <Row label="Turn" value={state.turn === "w" ? "White" : "Black"} />}
        {showLive && <Row label="Move" value={`${moveNumber}. ${lastSan}`} />}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="truncate text-right font-medium text-foreground">{value}</dd>
    </div>
  );
}
