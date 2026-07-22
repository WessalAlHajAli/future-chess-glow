import { pieceGlyph } from "./piece-symbol";

interface Props {
  captured: { w: string[]; b: string[] };
}

const ORDER = ["q", "r", "b", "n", "p"];

function sortPieces(list: string[]): string[] {
  return [...list].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
}

function materialAdvantage(captured: { w: string[]; b: string[] }): number {
  const val: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const w = captured.w.reduce((s, p) => s + (val[p] ?? 0), 0);
  const b = captured.b.reduce((s, p) => s + (val[p] ?? 0), 0);
  return w - b;
}

export function CapturedPieces({ captured }: Props) {
  const adv = materialAdvantage(captured);
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-4 backdrop-blur-sm">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Captured</h3>
      <div className="space-y-2">
        <Row label="You" color="w" pieces={sortPieces(captured.w)} />
        <Row label="AI" color="b" pieces={sortPieces(captured.b)} />
      </div>
      {adv !== 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Material:{" "}
          <span className={adv > 0 ? "font-medium text-primary" : "font-medium text-destructive"}>
            {adv > 0 ? `+${adv}` : adv}
          </span>
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  color,
  pieces,
}: {
  label: string;
  color: "w" | "b";
  pieces: string[];
}) {
  const opp = color === "w" ? "b" : "w";
  return (
    <div className="grid grid-cols-[2.5rem_1fr] items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex min-h-6 flex-wrap gap-0.5 text-xl leading-none">
        {pieces.length === 0 ? (
          <span className="text-xs text-muted-foreground/60">\u2014</span>
        ) : (
          pieces.map((p, i) => (
            <span key={i} className={opp === "w" ? "text-amber-100" : "text-zinc-800"}>
              {pieceGlyph(opp, p)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}