import { Bot, User } from "lucide-react";

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
    <div
      className={`relative rounded-2xl border bg-card/80 p-4 backdrop-blur-sm transition-all ${
        isTurn ? "border-primary/60 amber-glow" : "border-border"
      }`}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${
            side === "player"
              ? "bg-gradient-to-br from-amber-300/20 to-amber-600/20 text-primary"
              : "bg-gradient-to-br from-zinc-500/20 to-zinc-800/40 text-muted-foreground"
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold text-foreground">{name}</p>
            {isTurn && (
              <span className="inline-flex h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-primary" />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {isThinking ? "Thinking\u2026" : subtitle}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg tabular-nums text-foreground">{clock}</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Clock
          </p>
        </div>
      </div>
    </div>
  );
}