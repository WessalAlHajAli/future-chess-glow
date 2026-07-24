import { Bot, Star, User } from "lucide-react";

interface Props {
  side: "player" | "ai";
  name: string;
  subtitle: string;
  isTurn: boolean;
  isThinking?: boolean;
  clock?: string;
}

export function PlayerPanel({
  side,
  name,
  subtitle,
  isTurn,
  isThinking,
  clock = "10:00",
}: Props) {
  const Icon = side === "player" ? User : Bot;
  return (
    <div className="panel animate-fade-in flex flex-col items-center gap-3 p-5 text-center">
      <div
        className={`grid h-20 w-20 place-items-center rounded-full border-2 transition-all ${
          isTurn
            ? "border-primary animate-glow-pulse"
            : "border-primary/40"
        }`}
      >
        <Icon className="h-9 w-9 text-primary/85" strokeWidth={1.6} />
      </div>
      <div>
        <p className="font-serif text-xl font-medium text-foreground">{name}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground">
          {subtitle}
          <Star className="h-3 w-3 fill-primary text-primary" />
        </p>
      </div>
      <div className="mt-1 w-full rounded-md border border-primary/25 bg-black/40 px-4 py-2 text-center">
        <p className="font-mono text-2xl tracking-widest text-primary tabular-nums">
          {clock}
        </p>
      </div>
      {isThinking && (
        <p className="text-[11px] uppercase tracking-widest text-primary/70">
          Thinking&hellip;
        </p>
      )}
    </div>
  );
}