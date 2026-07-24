interface Props {
  score: number;
}

export function EvaluationBar({ score }: Props) {
  const clamped = Math.max(-10, Math.min(10, score));
  const whitePct = ((clamped + 10) / 20) * 100;
  const label =
    Math.abs(score) < 0.5
      ? "Balanced"
      : score > 0
        ? "White slight edge"
        : "Black slight edge";
  return (
    <div className="panel animate-fade-in p-4">
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">
        AI Evaluation
      </p>
      <div className="flex items-end justify-between">
        <p className="font-serif text-3xl font-medium text-primary tabular-nums">
          {score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)}
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