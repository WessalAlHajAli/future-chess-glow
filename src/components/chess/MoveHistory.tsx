import type { Move } from "chess.js";

import { ScrollArea } from "../ui/scroll-area";

interface Props {
  moves: Move[];
}

export function MoveHistory({ moves }: Props) {
  const pairs: { number: number; white?: Move; black?: Move }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: i / 2 + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Move History</h3>
        <span className="text-xs text-muted-foreground">{moves.length} moves</span>
      </div>
      <ScrollArea className="h-48">
        {pairs.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No moves yet.
          </p>
        ) : (
          <ol className="space-y-1 pr-3 font-mono text-sm">
            {pairs.map((p) => (
              <li
                key={p.number}
                className="grid grid-cols-[2.2rem_1fr_1fr] items-center gap-2"
              >
                <span className="text-xs text-muted-foreground">{p.number}.</span>
                <span className="rounded px-2 py-0.5 text-foreground hover:bg-muted/60">
                  {p.white?.san ?? ""}
                </span>
                <span className="rounded px-2 py-0.5 text-muted-foreground hover:bg-muted/60">
                  {p.black?.san ?? ""}
                </span>
              </li>
            ))}
          </ol>
        )}
      </ScrollArea>
    </div>
  );
}