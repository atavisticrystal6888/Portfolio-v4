"use client";

import { useRef, useEffect, useMemo } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/hooks/useTheme";
import styles from "./AarkidScene.module.css";

/**
 * Stylised potted plant — procedural geometry, no external models.
 * Theme-reactive (leaf colour shifts with dark/light), gently drifting
 * to suggest "alive". Sits behind the hero copy, decorative only.
 */

const THEME = {
  dark: {
    leaf: "#5ba4b5",
    leafHighlight: "#8fd0e0",
    stem: "#3a6b75",
    pot: "#2a3a3f",
    soil: "#1a2024",
    bg: "#0a0e10",
  },
  light: {
    leaf: "#2d8a9c",
    leafHighlight: "#5fb3c4",
    stem: "#1f5f6a",
    pot: "#d4c4a8",
    soil: "#5a4838",
    bg: "#f5f1e8",
  },
} satisfies Record<"dark" | "light", Palette>;

interface Palette {
  leaf: string;
  leafHighlight: string;
  stem: string;
  pot: string;
  soil: string;
  bg: string;
}

type LeafProps = ThreeElements["mesh"] & {
  rotationY: number;
  height: number;
  size: number;
  colorHex: string;
  highlightHex: string;
};

function Leaf({ rotationY, height, size, colorHex, highlightHex, ...rest }: LeafProps) {
  // Build a curved leaf shape: ellipse extruded along a curve.
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 0.5 * size;
    const h = 1.2 * size;
    shape.moveTo(0, 0);
    shape.bezierCurveTo(w, h * 0.2, w, h * 0.8, 0, h);
    shape.bezierCurveTo(-w, h * 0.8, -w, h * 0.2, 0, 0);

    const geo = new THREE.ShapeGeometry(shape, 24);
    // Bend the leaf along its length for depth
    const pos = geo.attributes.position;
    if (pos) {
      for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i);
        const bend = Math.sin((y / h) * Math.PI) * 0.18 * size;
        pos.setZ(i, bend);
      }
      pos.needsUpdate = true;
    }
    geo.computeVertexNormals();
    return geo;
  }, [size]);

  return (
    <mesh
      geometry={geometry}
      rotation={[Math.PI / 2 - 0.4, rotationY, 0]}
      position={[0, height, 0]}
      {...rest}
    >
      <meshStandardMaterial
        color={colorHex}
        roughness={0.55}
        metalness={0.05}
        side={THREE.DoubleSide}
        emissive={highlightHex}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

function Plant({ palette }: { palette: Palette }) {
  const groupRef = useRef<THREE.Group>(null);
  const leafCount = 7;

  const leaves = useMemo(() => {
    const arr: { rotationY: number; height: number; size: number }[] = [];
    for (let i = 0; i < leafCount; i++) {
      arr.push({
        rotationY: (i / leafCount) * Math.PI * 2,
        height: 0.4 + i * 0.15,
        size: 0.55 + Math.sin(i * 1.3) * 0.1,
      });
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += delta * 0.15;
    // Gentle "breathing" sway
    const t = performance.now() * 0.001;
    g.rotation.z = Math.sin(t * 0.6) * 0.02;
    g.position.y = Math.sin(t * 0.8) * 0.03;
  });

  return (
    <group ref={groupRef}>
      {/* Pot */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.85, 0.65, 0.7, 32]} />
        <meshStandardMaterial color={palette.pot} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.05, 32]} />
        <meshStandardMaterial color={palette.soil} roughness={1} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.06, 0.09, 1.6, 12]} />
        <meshStandardMaterial color={palette.stem} roughness={0.7} />
      </mesh>
      {/* Leaves */}
      {leaves.map((leaf, i) => (
        <Leaf
          key={i}
          rotationY={leaf.rotationY}
          height={leaf.height}
          size={leaf.size}
          colorHex={palette.leaf}
          highlightHex={palette.leafHighlight}
        />
      ))}
    </group>
  );
}

interface AarkidSceneProps {
  /** Pause when the hero is offscreen to save CPU/GPU. */
  active: boolean;
}

export function AarkidScene({ active }: AarkidSceneProps) {
  const { mode } = useTheme();
  const palette = mode === "light" ? THEME.light : THEME.dark;

  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 38 }}
        dpr={[1, Math.min(typeof window !== "undefined" ? window.devicePixelRatio : 2, 2)]}
        gl={{ antialias: true, alpha: true }}
        frameloop={active ? "always" : "demand"}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 2]} intensity={0.9} />
        <directionalLight position={[-2, 1, 3]} intensity={0.35} color={palette.leafHighlight} />
        <Plant palette={palette} />
      </Canvas>
    </div>
  );
}

export default AarkidScene;
