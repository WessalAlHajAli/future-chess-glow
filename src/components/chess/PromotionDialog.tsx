import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { pieceGlyph } from "./piece-symbol";

interface Props {
  open: boolean;
  color: "w" | "b";
  onSelect: (piece: "q" | "r" | "b" | "n") => void;
  onCancel: () => void;
}

const CHOICES: Array<{ key: "q" | "r" | "b" | "n"; label: string }> = [
  { key: "q", label: "Queen" },
  { key: "r", label: "Rook" },
  { key: "b", label: "Bishop" },
  { key: "n", label: "Knight" },
];

export function PromotionDialog({ open, color, onSelect, onCancel }: Props) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Promote your pawn</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-2">
          {CHOICES.map((c) => (
            <button
              key={c.key}
              onClick={() => onSelect(c.key)}
              className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/40 p-3 transition hover:border-primary hover:bg-muted"
            >
              <span className="text-4xl">{pieceGlyph(color, c.key)}</span>
              <span className="text-xs text-muted-foreground">{c.label}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}