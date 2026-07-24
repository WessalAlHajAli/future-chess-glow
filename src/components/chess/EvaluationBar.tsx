interface Props {
  /** Material-only fallback score, whole pawns, white-positive. */
  score: number;
  /** Live engine evaluation in centipawns, white-positive. */
  engineCp?: number | null;
  /** Forced-mate distance in plies (white-positive when white mates). */
  engineMate?: number | null;
  /** Engine search depth reached. */
  engineDepth?: number | null;
  /** Engine display name (e.g. "Stockfish"). */
  engineName?: string;
  /** Whether the engine is currently searching. */
  thinking?: boolean;
}

function labelFor(pawns: number, mate: number | null | undefined): string {
  if (mate != null && mate !== 0) {
    return mate > 0 ? `Mate in ${Math.abs(mate)}` : `Mated in ${Math.abs(mate)}`;
  }
  const a = Math.abs(pawns);
  if (a < 0.3) return "Balanced";
  const side = pawns > 0 ? "White" : "Black";
  if (a < 1) return `${side} slight edge`;
  if (a < 2.5) return `${side} better`;
  if (a < 5) return `${side} clearly winning`;
  return `${side} decisive`;
}

export function EvaluationBar({
  score,
  engineCp,
  engineMate,
  engineDepth,
  engineName,
  thinking,
}: Props) {
  const usingEngine = engineCp != null || (engineMate != null && engineMate !== 0);
  const pawns = engineCp != null ? engineCp / 100 : score;
  const clamped = engineMate != null && engineMate !== 0
    ? engineMate > 0 ? 10 : -10
    : Math.max(-10, Math.min(10, pawns));
  const whitePct = ((clamped + 10) / 20) * 100;
  const label = labelFor(pawns, engineMate);

  const display = engineMate != null && engineMate !== 0
    ? `${engineMate > 0 ? "+" : "-"}M${Math.abs(engineMate)}`
    : pawns > 0
      ? `+${pawns.toFixed(2)}`
      : pawns.toFixed(2);

  return (
    <div className="panel animate-fade-in p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">
          {usingEngine ? `${engineName ?? "Engine"} Eval` : "AI Evaluation"}
        </p>
        {engineDepth != null && usingEngine ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            d{engineDepth}
            {thinking ? " · …" : ""}
          </p>
        ) : thinking ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            thinking…
          </p>
        ) : null}
      </div>
      <div className="flex items-end justify-between">
        <p className="font-serif text-3xl font-medium text-primary tabular-nums">
          {display}
        </p>
        <p className="pb-1 text-xs text-muted-foreground">{label}</p>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/60 ring-1 ring-primary/20">
        <div
          className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 transition-all"
          style={{ width: `${whitePct}%` }}
        />
      </div>
    </div>
  );
}