// Stockfish engine wrapper.
//
// Loads Stockfish in a Blob-URL Web Worker that importScripts the pure-JS
// build from a CDN (permissive CORS). Falls back to the in-house negamax if
// loading fails (offline preview, blocked CDN, or slow network).

import { Chess, type Move } from "chess.js";

import { pickAiMove, type Difficulty } from "./chess-ai";

// Stockfish 11 pure-JS build — works reliably in a Web Worker via
// importScripts. Newer WASM builds need special COOP/COEP headers we can't
// guarantee in the preview.
const CDN_URLS = [
  "https://unpkg.com/stockfish@11.0.0/src/stockfish.js",
  "https://cdn.jsdelivr.net/npm/stockfish@11.0.0/src/stockfish.js",
];

export interface EngineMove {
  from: string;
  to: string;
  promotion?: string;
}

export interface EngineResult {
  move: EngineMove;
  cp?: number;
  mate?: number;
  depth?: number;
  usedStockfish: boolean;
}

const SKILL: Record<Difficulty, number> = {
  beginner: 0,
  easy: 3,
  medium: 6,
  hard: 10,
  expert: 14,
  master: 17,
  grandmaster: 20,
};

const MOVETIME_MS: Record<Difficulty, number> = {
  beginner: 150,
  easy: 250,
  medium: 400,
  hard: 700,
  expert: 1000,
  master: 1500,
  grandmaster: 2200,
};

const MAX_DEPTH: Record<Difficulty, number> = {
  beginner: 3,
  easy: 5,
  medium: 8,
  hard: 12,
  expert: 16,
  master: 20,
  grandmaster: 24,
};

type WorkerState = {
  worker: Worker;
  queue: Promise<unknown>;
};

let loaderPromise: Promise<WorkerState | null> | null = null;

function createBlobWorker(cdnUrl: string): Worker {
  const src = `
    self.onmessage = function(){};
    try {
      importScripts(${JSON.stringify(cdnUrl)});
    } catch (e) {
      self.postMessage("LOAD_ERROR:" + (e && e.message ? e.message : String(e)));
    }
  `;
  const blob = new Blob([src], { type: "application/javascript" });
  return new Worker(URL.createObjectURL(blob));
}

function loadEngine(): Promise<WorkerState | null> {
  if (loaderPromise) return loaderPromise;
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    return Promise.resolve(null);
  }
  loaderPromise = new Promise((resolve) => {
    let idx = 0;
    const tryUrl = () => {
      if (idx >= CDN_URLS.length) {
        resolve(null);
        return;
      }
      const url = CDN_URLS[idx++];
      let worker: Worker;
      try {
        worker = createBlobWorker(url);
      } catch {
        tryUrl();
        return;
      }
      let done = false;
      const finish = (w: Worker | null) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (!w) {
          try {
            worker.terminate();
          } catch {
            /* ignore */
          }
          tryUrl();
        } else {
          resolve({ worker: w, queue: Promise.resolve() });
        }
      };
      const onMsg = (e: MessageEvent) => {
        const line = typeof e.data === "string" ? e.data : "";
        if (line.startsWith("LOAD_ERROR")) {
          worker.removeEventListener("message", onMsg);
          finish(null);
          return;
        }
        if (line.includes("uciok") || line.includes("readyok")) {
          worker.removeEventListener("message", onMsg);
          finish(worker);
        }
      };
      worker.addEventListener("message", onMsg);
      worker.addEventListener("error", () => finish(null));
      const timer = setTimeout(() => finish(null), 6000);
      try {
        worker.postMessage("uci");
        worker.postMessage("isready");
      } catch {
        finish(null);
      }
    };
    tryUrl();
  });
  return loaderPromise;
}

export async function isStockfishAvailable(): Promise<boolean> {
  const s = await loadEngine();
  return !!s;
}

interface StockfishOptions {
  fen: string;
  difficulty: Difficulty;
  useFullStrength?: boolean;
}

async function runStockfish(
  state: WorkerState,
  { fen, difficulty, useFullStrength }: StockfishOptions,
): Promise<EngineResult | null> {
  const skill = useFullStrength ? 20 : SKILL[difficulty];
  const movetime = useFullStrength ? 1500 : MOVETIME_MS[difficulty];
  const depth = useFullStrength ? 22 : MAX_DEPTH[difficulty];
  const w = state.worker;

  return new Promise((resolve) => {
    let bestCp: number | undefined;
    let bestMate: number | undefined;
    let bestDepth: number | undefined;
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      w.removeEventListener("message", listener);
      resolve(null);
    }, movetime + 4000);

    const listener = (e: MessageEvent) => {
      const line = typeof e.data === "string" ? e.data : "";
      if (!line) return;
      if (line.startsWith("info")) {
        const cpMatch = line.match(/ score cp (-?\d+)/);
        const mateMatch = line.match(/ score mate (-?\d+)/);
        const depthMatch = line.match(/ depth (\d+)/);
        if (cpMatch) {
          bestCp = parseInt(cpMatch[1], 10);
          bestMate = undefined;
        }
        if (mateMatch) bestMate = parseInt(mateMatch[1], 10);
        if (depthMatch) bestDepth = parseInt(depthMatch[1], 10);
        return;
      }
      if (line.startsWith("bestmove")) {
        settled = true;
        clearTimeout(timeout);
        w.removeEventListener("message", listener);
        const parts = line.split(/\s+/);
        const uci = parts[1];
        if (!uci || uci === "(none)") {
          resolve(null);
          return;
        }
        const from = uci.slice(0, 2);
        const to = uci.slice(2, 4);
        const promotion = uci.length >= 5 ? uci[4] : undefined;
        resolve({
          move: { from, to, promotion },
          cp: bestCp,
          mate: bestMate,
          depth: bestDepth,
          usedStockfish: true,
        });
      }
    };

    w.addEventListener("message", listener);
    try {
      w.postMessage("ucinewgame");
      w.postMessage(`setoption name Skill Level value ${skill}`);
      w.postMessage(`position fen ${fen}`);
      w.postMessage(`go movetime ${movetime} depth ${depth}`);
    } catch {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        w.removeEventListener("message", listener);
        resolve(null);
      }
    }
  });
}

async function queued<T>(
  fn: (s: WorkerState) => Promise<T | null>,
): Promise<T | null> {
  const state = await loadEngine();
  if (!state) return null;
  const p = state.queue.then(() => fn(state));
  state.queue = p.catch(() => undefined);
  return p;
}

function materialCp(chess: Chess): number {
  const values: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900 };
  let s = 0;
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq) continue;
      const v = values[sq.type] ?? 0;
      s += sq.color === "w" ? v : -v;
    }
  }
  return chess.turn() === "w" ? s : -s;
}

function fallback(fen: string, difficulty: Difficulty): EngineResult | null {
  const mv = pickAiMove(fen, difficulty);
  if (!mv) return null;
  const chess = new Chess(fen);
  return {
    move: { from: mv.from, to: mv.to, promotion: (mv as Move).promotion },
    cp: materialCp(chess),
    usedStockfish: false,
  };
}

export async function chooseMove(
  fen: string,
  difficulty: Difficulty,
): Promise<EngineResult | null> {
  const sf = await queued((s) => runStockfish(s, { fen, difficulty }));
  if (sf) return sf;
  return fallback(fen, difficulty);
}

export async function analyzePosition(fen: string): Promise<EngineResult | null> {
  const sf = await queued((s) =>
    runStockfish(s, { fen, difficulty: "expert" }),
  );
  if (sf) return sf;
  return fallback(fen, "expert");
}

export async function bestHint(fen: string): Promise<EngineResult | null> {
  const sf = await queued((s) =>
    runStockfish(s, { fen, difficulty: "grandmaster", useFullStrength: true }),
  );
  if (sf) return sf;
  return fallback(fen, "grandmaster");
}
