"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTheme } from "@/hooks/useTheme";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useGPUTier, type GPUTier } from "@/hooks/useGPUTier";
import styles from "./ThreeHero.module.css";

const THEME_COLORS: Record<string, number> = {
  dark: 0x5ba4b5,
  light: 0x2d8a9c,
};

// Seeded PRNG for deterministic particle positions (render-pure)
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getParticleCount(tier: GPUTier): number {
  switch (tier) {
    case "high":
      return 1500;
    case "medium":
      return 800;
    case "low":
      return 400;
    default:
      return 0;
  }
}

/** Generate positions + velocities outside of React render */
function createParticleData(count: number) {
  const rand = mulberry32(42);
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    const r = 3 + rand() * 2;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    velocities[i * 3] = (rand() - 0.5) * 0.002;
    velocities[i * 3 + 1] = (rand() - 0.5) * 0.002;
    velocities[i * 3 + 2] = (rand() - 0.5) * 0.002;
  }
  return { positions, velocities };
}

function ParticleSphere({
  count,
  colorHex,
}: {
  count: number;
  colorHex: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const mouseTarget = useRef({ x: 0, y: 0 });
  const dataRef = useRef<{ positions: Float32Array; velocities: Float32Array } | null>(null);

  // Build the Three.js scene imperatively (avoids lint immutability rules)
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const data = createParticleData(count);
    dataRef.current = data;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));

    const mat = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pts = new THREE.Points(geo, mat);
    pointsRef.current = pts;
    group.add(pts);

    return () => {
      group.remove(pts);
      geo.dispose();
      mat.dispose();
      pointsRef.current = null;
      dataRef.current = null;
    };
  }, [count, colorHex]);

  // Global mouse listener (covers entire viewport, not just canvas)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseTarget.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", handler, { passive: true });
    return () => document.removeEventListener("mousemove", handler);
  }, []);

  useFrame(() => {
    const pts = pointsRef.current;
    const data = dataRef.current;
    if (!pts || !data) return;

    // Smooth mouse-reactive rotation (lerp toward target)
    const targetRotY = mouseTarget.current.x * 0.3;
    const targetRotX = mouseTarget.current.y * 0.15;
    pts.rotation.y += (targetRotY - pts.rotation.y) * 0.02;
    pts.rotation.x += (targetRotX - pts.rotation.x) * 0.02;

    // Gentle auto-rotation
    pts.rotation.y += 0.001;
    pts.rotation.z += 0.0003;

    // Per-particle drift with boundary bounce
    const posArr = data.positions;
    const vel = data.velocities;
    for (let i = 0; i < count * 3; i += 3) {
      posArr[i] = (posArr[i] ?? 0) + (vel[i] ?? 0);
      posArr[i + 1] = (posArr[i + 1] ?? 0) + (vel[i + 1] ?? 0);
      posArr[i + 2] = (posArr[i + 2] ?? 0) + (vel[i + 2] ?? 0);

      const px = posArr[i] ?? 0;
      const py = posArr[i + 1] ?? 0;
      const pz = posArr[i + 2] ?? 0;
      const dist = Math.sqrt(px * px + py * py + pz * pz);
      if (dist > 6 || dist < 2) {
        vel[i] = (vel[i] ?? 0) * -1;
        vel[i + 1] = (vel[i + 1] ?? 0) * -1;
        vel[i + 2] = (vel[i + 2] ?? 0) * -1;
      }
    }
    // Flag geometry as needing GPU upload
    const attr = pts.geometry.attributes.position;
    if (attr) (attr as THREE.BufferAttribute).needsUpdate = true;
  });

  return <group ref={groupRef} />;
}

function GradientFallback() {
  return (
    <div className={styles.fallback} aria-hidden="true">
      <div className={styles.fallbackGlow} />
    </div>
  );
}

export function ThreeHero() {
  const { mode } = useTheme();
  const prefersReduced = useReducedMotion();
  const gpuTier = useGPUTier();

  const particleCount = getParticleCount(gpuTier);
  const colorHex = THEME_COLORS[mode] ?? THEME_COLORS.dark!;

  if (gpuTier === "fallback" || prefersReduced) {
    return <GradientFallback />;
  }

  return (
    <div className={styles.canvas} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        gl={{ antialias: true, alpha: true }}
      >
        <ParticleSphere count={particleCount} colorHex={colorHex} />
      </Canvas>
    </div>
  );
}
