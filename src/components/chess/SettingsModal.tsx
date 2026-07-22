import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import type { Difficulty } from "../../lib/chess-ai";
import type { PlayerColor } from "../../hooks/use-chess-game";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  onChangeDifficulty: (d: Difficulty) => void;
  onChangePlayerColor: (c: PlayerColor) => void;
  onApplyAndNewGame: () => void;
}

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "Mostly random moves" },
  { value: "medium", label: "Medium", desc: "Basic tactics" },
  { value: "hard", label: "Hard", desc: "3-ply search" },
  { value: "master", label: "Master", desc: "Full 4-ply, no blunders" },
];

export function SettingsModal({
  open,
  onOpenChange,
  difficulty,
  playerColor,
  onChangeDifficulty,
  onChangePlayerColor,
  onApplyAndNewGame,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block text-sm font-medium">Difficulty</Label>
            <RadioGroup
              value={difficulty}
              onValueChange={(v) => onChangeDifficulty(v as Difficulty)}
              className="grid grid-cols-2 gap-2"
            >
              {DIFFICULTIES.map((d) => (
                <label
                  key={d.value}
                  htmlFor={`diff-${d.value}`}
                  className={`flex cursor-pointer flex-col rounded-xl border p-3 transition ${
                    difficulty === d.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/40 hover:border-primary/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={d.value} id={`diff-${d.value}`} />
                    <span className="font-medium text-foreground">{d.label}</span>
                  </div>
                  <span className="ml-6 text-xs text-muted-foreground">{d.desc}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Play as</Label>
            <RadioGroup
              value={playerColor}
              onValueChange={(v) => onChangePlayerColor(v as PlayerColor)}
              className="grid grid-cols-2 gap-2"
            >
              <label
                htmlFor="color-w"
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition ${
                  playerColor === "w"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40"
                }`}
              >
                <RadioGroupItem value="w" id="color-w" /> White
              </label>
              <label
                htmlFor="color-b"
                className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 transition ${
                  playerColor === "b"
                    ? "border-primary bg-primary/10"
                    : "border-border bg-muted/40"
                }`}
              >
                <RadioGroupItem value="b" id="color-b" /> Black
              </label>
            </RadioGroup>
          </div>
          <Button onClick={onApplyAndNewGame} className="w-full">
            Apply & Start New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}