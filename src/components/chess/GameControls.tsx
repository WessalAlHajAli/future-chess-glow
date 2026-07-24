import { Flag, Lightbulb, Plus, Settings, Undo2 } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  onNewGame: () => void;
  onUndo: () => void;
  onHint: () => void;
  onSettings: () => void;
  onResign: () => void;
  disabled?: boolean;
}

export function GameControls({
  onNewGame,
  onUndo,
  onHint,
  onSettings,
  onResign,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3">
      <ControlButton icon={<Plus className="h-5 w-5" />} label="New Game" onClick={onNewGame} />
      <ControlButton icon={<Undo2 className="h-5 w-5" />} label="Undo" onClick={onUndo} disabled={disabled} />
      <ControlButton icon={<Lightbulb className="h-5 w-5" />} label="Hint" onClick={onHint} disabled={disabled} />
      <ControlButton icon={<Settings className="h-5 w-5" />} label="Settings" onClick={onSettings} />
      <ControlButton icon={<Flag className="h-5 w-5" />} label="Resign" onClick={onResign} destructive disabled={disabled} />
    </div>
  );
}

function ControlButton({
  icon,
  label,
  onClick,
  disabled,
  destructive,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group panel flex min-h-24 flex-col items-center justify-center gap-2 px-2 py-4 text-xs uppercase tracking-[0.2em] transition-all disabled:opacity-40 ${
        destructive
          ? "text-destructive/90 hover:border-destructive/60 hover:bg-destructive/10"
          : "text-primary/85 hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-black/40 text-primary transition-colors group-hover:border-primary/70">
        {icon}
      </span>
      <span className="font-serif text-[11px]">{label}</span>
    </button>
  );
}