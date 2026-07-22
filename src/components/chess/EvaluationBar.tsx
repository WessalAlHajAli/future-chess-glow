interface Props {
  score: number;
}

export function EvaluationBar({ score }: Props) {
  const clamped = Math.max(-10, Math.min(10, score));
  const whitePct = ((clamped + 10) / 20) * 100;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>Evaluation</span>
        <span className="font-mono tabular-nums text-foreground">
          {score > 0 ? `+${score}` : score}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 transition-all"
          style={{ width: `${whitePct}%` }}
        />
      </div>
    </div>
  );
}