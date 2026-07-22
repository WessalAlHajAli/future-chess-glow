import { useMemo } from "react";
import * as THREE from "three";

export type PieceType = "p" | "n" | "b" | "r" | "q" | "k";
export type PieceColor = "w" | "b";

function makeLatheShape(profile: [number, number][]): THREE.LatheGeometry {
  const points = profile.map(([r, y]) => new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(points, 48);
}

const PROFILES: Record<PieceType, [number, number][]> = {
  p: [
    [0.0, 0.0],
    [0.32, 0.0],
    [0.32, 0.05],
    [0.24, 0.08],
    [0.16, 0.18],
    [0.14, 0.34],
    [0.2, 0.42],
    [0.0, 0.48],
  ],
  r: [
    [0.0, 0.0],
    [0.36, 0.0],
    [0.36, 0.06],
    [0.28, 0.09],
    [0.22, 0.5],
    [0.28, 0.58],
    [0.32, 0.62],
    [0.0, 0.62],
  ],
  n: [
    [0.0, 0.0],
    [0.36, 0.0],
    [0.36, 0.06],
    [0.26, 0.1],
    [0.22, 0.28],
    [0.0, 0.34],
  ],
  b: [
    [0.0, 0.0],
    [0.34, 0.0],
    [0.34, 0.06],
    [0.24, 0.1],
    [0.16, 0.4],
    [0.22, 0.5],
    [0.14, 0.62],
    [0.08, 0.72],
    [0.0, 0.76],
  ],
  q: [
    [0.0, 0.0],
    [0.38, 0.0],
    [0.38, 0.07],
    [0.28, 0.11],
    [0.2, 0.55],
    [0.26, 0.66],
    [0.22, 0.78],
    [0.28, 0.86],
    [0.0, 0.9],
  ],
  k: [
    [0.0, 0.0],
    [0.4, 0.0],
    [0.4, 0.07],
    [0.3, 0.11],
    [0.22, 0.6],
    [0.28, 0.72],
    [0.22, 0.84],
    [0.26, 0.92],
    [0.0, 0.96],
  ],
};

interface Props {
  type: PieceType;
  color: PieceColor;
  position: [number, number, number];
  highlight?: boolean;
  onClick?: (e: unknown) => void;
}

export function ChessPiece3D({ type, color, position, highlight, onClick }: Props) {
  const geometry = useMemo(() => makeLatheShape(PROFILES[type]), [type]);

  // Knight gets a small tilted head cap so it isn't a plain cone.
  const knightHead = type === "n";

  const isWhite = color === "w";

  return (
    <group position={position} onClick={onClick}>
      {/* Base ring shadow catcher */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.36, 32]} />
        <meshBasicMaterial
          color={isWhite ? "#f4e6c8" : "#1a1a1a"}
          transparent
          opacity={0.25}
        />
      </mesh>

      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={isWhite ? "#f0e2c0" : "#242322"}
          metalness={isWhite ? 0.15 : 0.85}
          roughness={isWhite ? 0.35 : 0.35}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          emissive={highlight ? "#f2b45c" : "#000000"}
          emissiveIntensity={highlight ? 0.4 : 0}
        />
      </mesh>

      {knightHead && (
        <mesh position={[0, 0.5, 0.05]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.28, 0.35, 0.22]} />
          <meshPhysicalMaterial
            color={isWhite ? "#f0e2c0" : "#242322"}
            metalness={isWhite ? 0.15 : 0.85}
            roughness={0.35}
            clearcoat={0.6}
            emissive={highlight ? "#f2b45c" : "#000000"}
            emissiveIntensity={highlight ? 0.4 : 0}
          />
        </mesh>
      )}

      {/* Crown cross for king */}
      {type === "k" && (
        <>
          <mesh position={[0, 1.02, 0]} castShadow>
            <boxGeometry args={[0.08, 0.16, 0.08]} />
            <meshPhysicalMaterial
              color={isWhite ? "#f0e2c0" : "#242322"}
              metalness={isWhite ? 0.15 : 0.85}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 1.02, 0]} castShadow>
            <boxGeometry args={[0.2, 0.06, 0.08]} />
            <meshPhysicalMaterial
              color={isWhite ? "#f0e2c0" : "#242322"}
              metalness={isWhite ? 0.15 : 0.85}
              roughness={0.35}
            />
          </mesh>
        </>
      )}

      {/* Small orb for queen crown */}
      {type === "q" && (
        <mesh position={[0, 0.96, 0]} castShadow>
          <sphereGeometry args={[0.07, 24, 24]} />
          <meshPhysicalMaterial
            color={isWhite ? "#f0e2c0" : "#242322"}
            metalness={isWhite ? 0.15 : 0.85}
            roughness={0.3}
          />
        </mesh>
      )}

      {highlight && (
        <pointLight
          position={[0, 0.5, 0]}
          color="#f2b45c"
          intensity={0.8}
          distance={1.6}
        />
      )}
    </group>
  );
}