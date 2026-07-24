import {
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  type Difficulty,
} from "../../lib/chess-ai";

interface Props {
  difficulty: Difficulty;
  onChange?: (d: Difficulty) => void;
}

export function DifficultyBar({ difficulty, onChange }: Props) {
  const idx = DIFFICULTY_ORDER.indexOf(difficulty);
  return (
    <div className="panel animate-fade-in p-4">
      <div className="mb-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.3em]">
        <span className="text-primary/80">Difficulty</span>
        <span className="text-foreground">{DIFFICULTY_LABELS[difficulty]}</span>
      </div>
      <div className="flex gap-1">
        {DIFFICULTY_ORDER.map((d, i) => (
          <button
            key={d}
            type="button"
            onClick={() => onChange?.(d)}
            aria-label={`Set difficulty ${DIFFICULTY_LABELS[d]}`}
            className={`h-2.5 flex-1 rounded-full transition-all ${
              i <= idx
                ? "bg-primary shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                : "bg-primary/15 hover:bg-primary/40"
            } ${onChange ? "cursor-pointer" : "cursor-default"}`}
          />
        ))}
      </div>
      {onChange && (
        <p className="mt-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          Tap a bar to switch level
        </p>
      )}
    </div>
  );
}