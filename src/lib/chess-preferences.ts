export type BoardColor = "classic" | "walnut" | "emerald" | "slate" | "royal";
export type PieceStyle = "classic" | "modern" | "wooden";
export type AnimationSpeed = "off" | "slow" | "normal" | "fast";
export type BoardOrientationPref = "auto" | "white" | "black";

export interface Preferences {
  boardColor: BoardColor;
  pieceStyle: PieceStyle;
  soundsEnabled: boolean;
  animationSpeed: AnimationSpeed;
  boardOrientation: BoardOrientationPref;
  showCoordinates: boolean;
  highlightMoves: boolean;
  showLegalMoves: boolean;
  playerName: string;
  playerCountry: string;
  playerAvatar: string; // data URL or empty
}

export const DEFAULT_PREFS: Preferences = {
  boardColor: "classic",
  pieceStyle: "classic",
  soundsEnabled: true,
  animationSpeed: "normal",
  boardOrientation: "auto",
  showCoordinates: true,
  highlightMoves: true,
  showLegalMoves: true,
  playerName: "You",
  playerCountry: "",
  playerAvatar: "",
};


const KEY = "aichess-prefs-v1";

export function loadPrefs(): Preferences {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(p: Preferences) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export const BOARD_COLORS: Record<BoardColor, { light: string; dark: string; label: string }> = {
  classic: { light: "#e9dcc0", dark: "#2b241d", label: "Classic Ivory" },
  walnut: { light: "#e8cfa8", dark: "#5a3a20", label: "Walnut" },
  emerald: { light: "#e4e9d8", dark: "#3a5a4a", label: "Emerald" },
  slate: { light: "#e6e6ea", dark: "#3a3a44", label: "Slate" },
  royal: { light: "#f2e2b6", dark: "#1c1410", label: "Royal Gold" },
};

export function animationDurationMs(speed: AnimationSpeed): number {
  return ({ off: 0, slow: 380, normal: 220, fast: 90 } as const)[speed];
}