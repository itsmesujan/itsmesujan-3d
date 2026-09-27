"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "./SceneCanvas";
import { TIER_BUDGET, type Tier } from "@/lib/capability";

/**
 * Hero swarm — a quiet, always-on field of agents.
 *
 * Deliberately restrained: the hero is the orientation beat, so this drifts
 * gently and never demands scroll. The dramatic resolve is reserved for the
 * method section, where the same particles lock into the six-stage loop.
 */

const INK = new THREE.Color("#0a0a0a");
const SIGNAL = new THREE.Color("#ff4d1c");

function Swarm({ count, reduced }: { count: number; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);

  const agents = useMemo(() => {
    const rand = (i: number, salt: number) => {
      const x = Math.sin(i * 91.7 + salt * 217.3) * 43758.5453;
      return x - Math.floor(x);
    };
    return Array.from({ length: count }, (_, i) => {
      const theta = rand(i, 1) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i, 2) - 1);
      const r = 4 + rand(i, 3) * 7;
      return {
        base: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * r,
          Math.sin(phi) * Math.sin(theta) * r * 0.62,
          Math.cos(phi) * r * 0.7,
        ),
        phase: rand(i, 4) * Math.PI * 2,
        rate: 0.1 + rand(i, 5) * 0.28,
        amp: 0.25 + rand(i, 6) * 0.6,
        isSignal: rand(i, 7) > 0.86,
      };
    });
  }, [count]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);
  const col = useMemo(() => new THREE.Color(), []);

  useFrame((state) => {
    const pts = points.current;
    if (!pts) return;
    const t = reduced ? 0 : state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const a = agents[i];
      const i3 = i * 3;
      positions[i3] = a.base.x + Math.sin(t * a.rate + a.phase) * a.amp;
      positions[i3 + 1] = a.base.y + Math.cos(t * a.rate * 0.8 + a.phase) * a.amp;
      positions[i3 + 2] = a.base.z + Math.sin(t * a.rate * 0.5 + a.phase) * a.amp * 0.5;

      // A small share are signal-orange: the "active" agents in the fleet.
      col.copy(a.isSignal ? SIGNAL : INK);
      col.multiplyScalar(a.isSignal ? 0.85 : 0.55);
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.42}
        depthWrite={false}
      />
    </points>
  );
}

export function HeroSceneInner({ reduced }: { reduced: boolean }) {
  const count = reduced ? 120 : 420;
  return (
    <SceneCanvas
      fallback={null}
      camera={{ position: [0, 0, 7], fov: 50 }}
      maxDpr={1.25}
    >
      <Swarm count={count} reduced={reduced} />
    </SceneCanvas>
  );
}
