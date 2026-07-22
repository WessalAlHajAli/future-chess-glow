import { Flag, Lightbulb, RotateCcw, Settings, Undo2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../ui/button";

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
    <div className="grid grid-cols-5 gap-1 rounded-2xl border border-border bg-card/80 p-2 backdrop-blur-sm sm:gap-2">
      <ControlButton icon={<RotateCcw className="h-4 w-4" />} label="New" onClick={onNewGame} />
      <ControlButton
        icon={<Undo2 className="h-4 w-4" />}
        label="Undo"
        onClick={onUndo}
        disabled={disabled}
      />
      <ControlButton
        icon={<Lightbulb className="h-4 w-4" />}
        label="Hint"
        onClick={onHint}
        disabled={disabled}
      />
      <ControlButton
        icon={<Settings className="h-4 w-4" />}
        label="Settings"
        onClick={onSettings}
      />
      <ControlButton
        icon={<Flag className="h-4 w-4" />}
        label="Resign"
        onClick={onResign}
        destructive
        disabled={disabled}
      />
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
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-auto min-h-14 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs ${
        destructive
          ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
          : "hover:bg-muted"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}