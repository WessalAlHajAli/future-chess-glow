import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment } from "@react-three/drei";
import { Suspense, useMemo } from "react";
import type { Square } from "chess.js";
import { Chess } from "chess.js";

import { ChessPiece3D, type PieceType } from "./piece-geometry";
import type { GameState } from "../../hooks/use-chess-game";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

function squareToWorld(square: Square, playerColor: "w" | "b"): [number, number] {
  const file = square.charCodeAt(0) - 97; // 0..7
  const rank = parseInt(square[1], 10) - 1; // 0..7
  // playerColor "w" means white at bottom (rank 0 near camera)
  const x = (file - 3.5) * 1;
  const z = playerColor === "w" ? (3.5 - rank) * 1 : (rank - 3.5) * 1;
  return [x, z];
}

interface Props {
  state: GameState;
  onSquareClick: (square: Square) => void;
}

function BoardSquares({
  onSquareClick,
  selected,
  legalTargets,
  lastMove,
  playerColor,
  checkSquare,
}: {
  onSquareClick: (sq: Square) => void;
  selected: Square | null;
  legalTargets: Square[];
  lastMove: { from: Square; to: Square } | null;
  playerColor: "w" | "b";
  checkSquare: Square | null;
}) {
  const legalSet = useMemo(() => new Set(legalTargets), [legalTargets]);
  const nodes = [];
  for (const f of FILES) {
    for (const r of RANKS) {
      const sq = `${f}${r}` as Square;
      const file = f.charCodeAt(0) - 97;
      const rank = parseInt(r, 10) - 1;
      const isLight = (file + rank) % 2 === 1;
      const [x, z] = squareToWorld(sq, playerColor);
      const isSelected = selected === sq;
      const isLegal = legalSet.has(sq);
      const isLast = lastMove && (lastMove.from === sq || lastMove.to === sq);
      const isCheck = checkSquare === sq;

      let color = isLight ? "#d9c294" : "#3a2f24";
      if (isSelected) color = "#f2b45c";
      else if (isLast) color = isLight ? "#e8c98a" : "#5a4a35";
      else if (isCheck) color = "#c34a4a";

      nodes.push(
        <group key={sq} position={[x, 0, z]}>
          <mesh
            position={[0, 0.01, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            onClick={(e) => {
              e.stopPropagation();
              onSquareClick(sq);
            }}
            receiveShadow
          >
            <planeGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={color}
              roughness={0.6}
              metalness={0.05}
              emissive={isSelected ? "#f2b45c" : "#000000"}
              emissiveIntensity={isSelected ? 0.3 : 0}
            />
          </mesh>
          {isLegal && (
            <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.16, 24]} />
              <meshBasicMaterial color="#f2b45c" transparent opacity={0.7} />
            </mesh>
          )}
        </group>,
      );
    }
  }
  return <>{nodes}</>;
}

function Pieces({
  fen,
  playerColor,
  selected,
  onSquareClick,
}: {
  fen: string;
  playerColor: "w" | "b";
  selected: Square | null;
  onSquareClick: (sq: Square) => void;
}) {
  const chess = useMemo(() => new Chess(fen), [fen]);
  const meshes: JSX.Element[] = [];
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const cell = board[r][f];
      if (!cell) continue;
      const sq = (String.fromCharCode(97 + f) + (8 - r).toString()) as Square;
      const [x, z] = squareToWorld(sq, playerColor);
      meshes.push(
        <ChessPiece3D
          key={sq}
          type={cell.type as PieceType}
          color={cell.color}
          position={[x, 0.02, z]}
          highlight={selected === sq}
          onClick={(e: any) => {
            e.stopPropagation?.();
            onSquareClick(sq);
          }}
        />,
      );
    }
  }
  return <>{meshes}</>;
}

function BoardBase() {
  return (
    <group>
      {/* Board frame */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[9.2, 0.2, 9.2]} />
        <meshPhysicalMaterial
          color="#1a140d"
          metalness={0.5}
          roughness={0.45}
          clearcoat={0.4}
        />
      </mesh>
      {/* Inner playing surface (slightly recessed feel) */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8.02, 8.02]} />
        <meshStandardMaterial color="#241a12" roughness={0.7} />
      </mesh>
    </group>
  );
}

export function ChessBoard3D({ state, onSquareClick }: Props) {
  const checkSquare: Square | null = useMemo(() => {
    if (state.status !== "check" && state.status !== "checkmate") return null;
    const chess = new Chess(state.fen);
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const cell = board[r][f];
        if (cell && cell.type === "k" && cell.color === chess.turn()) {
          return (String.fromCharCode(97 + f) + (8 - r).toString()) as Square;
        }
      }
    }
    return null;
  }, [state.fen, state.status]);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 8, 8.6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#141010"]} />
        <fog attach="fog" args={["#0f0c0a", 14, 28]} />

        <ambientLight intensity={0.35} />
        <directionalLight
          position={[6, 12, 6]}
          intensity={1.1}
          color="#fff1d6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-6, 4, -6]} intensity={0.4} color="#f2b45c" />
        <pointLight position={[6, 4, 6]} intensity={0.3} color="#ffd39a" />

        <Suspense fallback={null}>
          <BoardBase />
          <BoardSquares
            onSquareClick={onSquareClick}
            selected={state.selected}
            legalTargets={state.legalTargets}
            lastMove={state.lastMove}
            playerColor={state.playerColor}
            checkSquare={checkSquare}
          />
          <Pieces
            fen={state.fen}
            playerColor={state.playerColor}
            selected={state.selected}
            onSquareClick={onSquareClick}
          />
          <ContactShadows
            position={[0, 0.02, 0]}
            opacity={0.55}
            scale={12}
            blur={2.4}
            far={4}
          />
          <Environment preset="warehouse" background={false} />
        </Suspense>

        {/* Locked straight, front-facing camera — no rotation allowed. */}
        <OrbitControls
          enableRotate={false}
          enablePan={false}
          enableZoom={false}
        />
      </Canvas>

      {/* Rank/file labels around the board */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-[3.4%] text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
          {(state.playerColor === "w" ? FILES : [...FILES].reverse()).map((f) => (
            <span key={f}>{f}</span>
          ))}
        </div>
        <div className="absolute top-0 bottom-0 left-2 flex flex-col justify-center gap-[3.4%] text-[10px] font-medium tracking-widest text-muted-foreground/70">
          {(state.playerColor === "w" ? [...RANKS].reverse() : RANKS).map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
}