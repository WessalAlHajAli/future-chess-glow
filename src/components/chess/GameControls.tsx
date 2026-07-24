import {
  Flag,
  FlipVertical2,
  Handshake,
  Lightbulb,
  Plus,
  Redo2,
  RotateCcw,
  Save,
  Settings,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  onNewGame: () => void;
  onRestart: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onSettings: () => void;
  onResign: () => void;
  onFlip: () => void;
  onSaveLoad: () => void;
  onOfferDraw: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
}

export function GameControls({
  onNewGame,
  onRestart,
  onUndo,
  onRedo,
  onHint,
  onSettings,
  onResign,
  onFlip,
  onSaveLoad,
  onOfferDraw,
  canUndo,
  canRedo,
  disabled,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-3">
      <ControlButton icon={<Plus className="h-5 w-5" />} label="New Game" onClick={onNewGame} />
      <ControlButton icon={<Undo2 className="h-5 w-5" />} label="Undo" onClick={onUndo} disabled={disabled || !canUndo} />
      <ControlButton icon={<Redo2 className="h-5 w-5" />} label="Redo" onClick={onRedo} disabled={disabled || !canRedo} />
      <ControlButton icon={<Lightbulb className="h-5 w-5" />} label="Hint" onClick={onHint} disabled={disabled} />
      <ControlButton icon={<FlipVertical2 className="h-5 w-5" />} label="Flip" onClick={onFlip} />
      <ControlButton icon={<RotateCcw className="h-5 w-5" />} label="Restart" onClick={onRestart} />
      <ControlButton icon={<Save className="h-5 w-5" />} label="Save / Load" onClick={onSaveLoad} />
      <ControlButton icon={<Handshake className="h-5 w-5" />} label="Draw" onClick={onOfferDraw} disabled={disabled} />
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
      className={`group panel flex min-h-20 flex-col items-center justify-center gap-2 px-2 py-3 text-xs uppercase tracking-[0.18em] transition-all disabled:opacity-40 sm:min-h-24 sm:py-4 ${
        destructive
          ? "text-destructive/90 hover:border-destructive/60 hover:bg-destructive/10"
          : "text-primary/85 hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
      }`}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full border border-primary/30 bg-black/40 text-primary transition-colors group-hover:border-primary/70 sm:h-9 sm:w-9">
        {icon}
      </span>
      <span className="font-serif text-[10px] sm:text-[11px]">{label}</span>
    </button>
  );
}