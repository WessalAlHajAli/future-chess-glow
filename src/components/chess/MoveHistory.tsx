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
    <div className="panel animate-fade-in p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">
          Move History
        </h3>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {moves.length}
        </span>
      </div>
      <ScrollArea className="h-40">
        {pairs.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No moves yet.
          </p>
        ) : (
          <ol className="space-y-1 pr-3 font-mono text-xs">
            {pairs.map((p) => (
              <li
                key={p.number}
                className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2"
              >
                <span className="text-primary/60">{p.number}.</span>
                <span className="rounded px-2 py-0.5 text-foreground/95 hover:bg-primary/10">
                  {p.white?.san ?? ""}
                </span>
                <span className="rounded px-2 py-0.5 text-muted-foreground hover:bg-primary/10">
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