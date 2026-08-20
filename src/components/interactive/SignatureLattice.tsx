"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { SignatureVariant } from "./signature-spec";
import { SIGNATURE_SPEC } from "./signature-spec";

/**
 * The WebGL half of SignatureScene. Imported only through a dynamic() call so
 * three.js never lands in a page's first-load chunk, and only ever rendered
 * once SignatureScene has cleared reduced-motion, GPU tier and viewport.
 *
 * A geodesic wireframe with a tilted ring: structure, not weather. The old
 * hero drifted 1500 additive points around, which at 0.7 opacity behind body
 * copy read as sensor noise and said nothing about the work.
 */

function Lattice({
  variant,
  colorHex,
  interactive,
}: {
  variant: SignatureVariant;
  colorHex: number;
  interactive: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group | null>(null);
  const ringRef = useRef<THREE.LineSegments | null>(null);
  const pointer = useRef({ x: 0, y: 0 });

  // Built imperatively rather than as JSX elements, matching the convention
  // the retired ThreeHero used: it keeps the geometry/material out of render
  // and makes disposal explicit.
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const spec = SIGNATURE_SPEC[variant];
    const spin = new THREE.Group();
    spinRef.current = spin;

    const shell = new THREE.IcosahedronGeometry(spec.radius, spec.detail);
    const shellWire = new THREE.WireframeGeometry(shell);
    const shellMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: spec.opacity,
    });
    const shellLines = new THREE.LineSegments(shellWire, shellMat);
    spin.add(shellLines);

    const ring = new THREE.TorusGeometry(spec.radius * spec.ringScale, 0.012, 3, 96);
    const ringWire = new THREE.WireframeGeometry(ring);
    const ringMat = new THREE.LineBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: spec.opacity * 0.55,
    });
    const ringLines = new THREE.LineSegments(ringWire, ringMat);
    ringLines.rotation.x = Math.PI / 2.6;
    ringRef.current = ringLines;
    spin.add(ringLines);

    group.add(spin);

    return () => {
      group.remove(spin);
      shell.dispose();
      shellWire.dispose();
      shellMat.dispose();
      ring.dispose();
      ringWire.dispose();
      ringMat.dispose();
      spinRef.current = null;
      ringRef.current = null;
    };
  }, [variant, colorHex]);

  useEffect(() => {
    if (!interactive) return;
    const handler = (e: MouseEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    document.addEventListener("mousemove", handler, { passive: true });
    return () => document.removeEventListener("mousemove", handler);
  }, [interactive]);

  useFrame((_, delta) => {
    const spin = spinRef.current;
    if (!spin) return;

    // delta-based so the drift is the same speed on a 60Hz and a 144Hz screen.
    spin.rotation.y += delta * 0.09;

    if (interactive) {
      const targetY = pointer.current.x * 0.28;
      const targetX = pointer.current.y * 0.18;
      spin.rotation.x += (targetX - spin.rotation.x) * 0.03;
      spin.position.x += (targetY * 0.35 - spin.position.x) * 0.03;
    }

    const ring = ringRef.current;
    if (ring) ring.rotation.z -= delta * 0.05;
  });

  return <group ref={groupRef} />;
}

export function SignatureLattice({
  variant,
  colorHex,
  interactive,
}: {
  variant: SignatureVariant;
  colorHex: number;
  interactive: boolean;
}) {
  const spec = SIGNATURE_SPEC[variant];

  return (
    <Canvas
      camera={{ position: [0, 0, spec.camZ], fov: 60 }}
      dpr={[1, Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, 2)]}
      gl={{ antialias: true, alpha: true }}
      frameloop="always"
    >
      <Lattice variant={variant} colorHex={colorHex} interactive={interactive} />
    </Canvas>
  );
}
