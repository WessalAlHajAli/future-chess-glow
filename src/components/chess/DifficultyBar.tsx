import type { Difficulty } from "../../lib/chess-ai";

interface Props {
  difficulty: Difficulty;
}

const LEVELS: Difficulty[] = ["easy", "medium", "hard", "master"];

export function DifficultyBar({ difficulty }: Props) {
  const idx = LEVELS.indexOf(difficulty);
  return (
    <div className="panel animate-fade-in p-4">
      <div className="mb-3 flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.3em]">
        <span className="text-primary/80">Difficulty</span>
        <span className="capitalize text-foreground">{difficulty}</span>
      </div>
      <div className="flex gap-1.5">
        {LEVELS.map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-all ${
              i <= idx
                ? "bg-primary shadow-[0_0_10px_rgba(212,175,55,0.6)]"
                : "bg-primary/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}