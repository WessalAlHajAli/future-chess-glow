import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  type Difficulty,
} from "../../lib/chess-ai";
import type { PlayerColor } from "../../hooks/use-chess-game";
import {
  BOARD_COLORS,
  type AnimationSpeed,
  type BoardColor,
  type BoardOrientationPref,
  type PieceStyle,
  type Preferences,
} from "../../lib/chess-preferences";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  difficulty: Difficulty;
  playerColor: PlayerColor;
  prefs: Preferences;
  onChangeDifficulty: (d: Difficulty) => void;
  onChangePlayerColor: (c: PlayerColor) => void;
  onChangePref: <K extends keyof Preferences>(k: K, v: Preferences[K]) => void;
  onApplyAndNewGame: () => void;
}

export function SettingsModal({
  open,
  onOpenChange,
  difficulty,
  playerColor,
  prefs,
  onChangeDifficulty,
  onChangePlayerColor,
  onChangePref,
  onApplyAndNewGame,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-widest">Settings</DialogTitle>
          <DialogDescription>
            Personalize the board, sounds, and gameplay. Changes save automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          <Section title="Gameplay">
            <Row label="Difficulty">
              <Select
                value={difficulty}
                onValueChange={(v) => onChangeDifficulty(v as Difficulty)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_ORDER.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIFFICULTY_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Play as">
              <Select
                value={playerColor}
                onValueChange={(v) => onChangePlayerColor(v as PlayerColor)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="w">White</SelectItem>
                  <SelectItem value="b">Black</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </Section>

          <Section title="Board">
            <Row label="Board colors">
              <Select
                value={prefs.boardColor}
                onValueChange={(v) => onChangePref("boardColor", v as BoardColor)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(BOARD_COLORS) as BoardColor[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {BOARD_COLORS[k].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Row>
            <Row label="Piece style">
              <Select
                value={prefs.pieceStyle}
                onValueChange={(v) => onChangePref("pieceStyle", v as PieceStyle)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="wooden">Wooden</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row label="Board orientation">
              <Select
                value={prefs.boardOrientation}
                onValueChange={(v) =>
                  onChangePref("boardOrientation", v as BoardOrientationPref)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (follow player)</SelectItem>
                  <SelectItem value="white">Always white</SelectItem>
                  <SelectItem value="black">Always black</SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Toggle
              label="Show coordinates"
              checked={prefs.showCoordinates}
              onCheckedChange={(v) => onChangePref("showCoordinates", v)}
            />
            <Toggle
              label="Highlight last move"
              checked={prefs.highlightMoves}
              onCheckedChange={(v) => onChangePref("highlightMoves", v)}
            />
            <Toggle
              label="Legal move indicators"
              checked={prefs.showLegalMoves}
              onCheckedChange={(v) => onChangePref("showLegalMoves", v)}
            />
          </Section>

          <Section title="Sound & Animation">
            <Toggle
              label="Sound effects"
              checked={prefs.soundsEnabled}
              onCheckedChange={(v) => onChangePref("soundsEnabled", v)}
            />
            <Row label="Animation speed">
              <Select
                value={prefs.animationSpeed}
                onValueChange={(v) =>
                  onChangePref("animationSpeed", v as AnimationSpeed)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="slow">Slow</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast</SelectItem>
                </SelectContent>
              </Select>
            </Row>
          </Section>

          <Button onClick={onApplyAndNewGame} className="w-full">
            Apply &amp; Start New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.3em] text-primary/80">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm">{label}</Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}