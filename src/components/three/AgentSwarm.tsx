"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { loopSteps } from "@/content/site";

/**
 * SCENE 1 — THE AGENT FLEET
 *
 * Concept: an undirected swarm of agents that, as you scroll, is *recruited*
 * into the six stages of the build loop. Scatter → gather → lock into the loop
 * → hold.
 *
 * The particles are not decoration. Each one is an agent, and the number of
 * agents that join a stage equals its share of the loop. The moment the ring
 * resolves is the moment the site's thesis is proven visually: a fleet, aimed
 * by one person, becomes a repeatable process.
 *
 * Scroll mapping is deliberately not linear — the first fifth establishes,
 * the middle three-fifths resolve, the last fifth holds so the labels can be
 * read. Mobile gets a shorter travel and a settled state.
 */

const PAPER = new THREE.Color("#f4f1ea");
const INK = new THREE.Color("#0a0a0a");
const SIGNAL = new THREE.Color("#ff4d1c");

type SwarmProps = {
  /** Scroll progress 0–1 for this section. */
  progress: number;
  /** Total agents. Budget-capped by the quality tier. */
  count: number;
  /** Pause continuous drift. */
  paused: boolean;
  /** Pointer tilt axes, -1–1. Ignored on coarse pointers. */
  pointer: { x: number; y: number };
  /** Allow pointer response (fine pointer only). */
  allowTilt: boolean;
};

export function AgentSwarm({
  progress,
  count,
  paused,
  pointer,
  allowTilt,
}: SwarmProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Six target positions, one per loop stage, arranged on a ring.
  const targets = useMemo(() => {
    const radius = 2.9;
    return loopSteps.map((_, i) => {
      const a = (i / loopSteps.length) * Math.PI * 2 - Math.PI / 2;
      return new THREE.Vector3(
        Math.cos(a) * radius,
        Math.sin(a) * radius,
        0,
      );
    });
  }, []);

  /**
   * Per-agent home position, target stage, and phase. Deterministic —
   * Math.random would make every reload look different and break the
   * "same six stages every time" promise the copy makes.
   */
  const agents = useMemo(() => {
    // A cheap deterministic hash keeps this stable and seedable.
    const rand = (i: number, salt: number) => {
      const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
      return x - Math.floor(x);
    };

    return Array.from({ length: count }, (_, i) => {
      // Each agent is assigned a stage; stages get proportional share.
      const stage = i % targets.length;
      // Scatter: a wide, loose shell well outside the ring.
      const theta = rand(i, 1) * Math.PI * 2;
      const phi = Math.acos(2 * rand(i, 2) - 1);
      const scatterR = 5.5 + rand(i, 3) * 5.5;

      return {
        stage,
        scatter: new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * scatterR,
          Math.sin(phi) * Math.sin(theta) * scatterR * 0.72,
          Math.cos(phi) * scatterR,
        ),
        // Small orbital offset so the ring has body and reads as six
        // distinct clusters rather than a thin necklace.
        orbit: (rand(i, 4) - 0.5) * 1.35,
        phase: rand(i, 5) * Math.PI * 2,
        wobble: 0.4 + rand(i, 6) * 0.7,
        // Per-agent stagger keeps resolution from looking mechanical.
        delay: rand(i, 7) * 0.18,
      };
    });
  }, [count, targets.length]);

  const positions = useMemo(() => new Float32Array(count * 3), [count]);
  const colors = useMemo(() => new Float32Array(count * 3), [count]);

  // Geometry for the resolved ring — the six-stage connector.
  const ringLine = useMemo(() => {
    const geom = new THREE.BufferGeometry().setFromPoints([
      ...targets,
      targets[0].clone(),
    ]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xff4d1c,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    return new THREE.Line(geom, mat);
  }, [targets]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const tmpTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const pts = pointsRef.current;
    if (!pts) return;

    /*
     * Interval shape: establish → resolve → hold.
     * - 0.00–0.20  scatter, drifting, unreadable on purpose
     * - 0.20–0.80  the resolve, eased so it feels guided not thrown
     * - 0.80–1.00  hold, only a slow breath remains
     */
    const raw = THREE.MathUtils.clamp((progress - 0.2) / 0.6, 0, 1);
    const resolve = 1 - Math.pow(1 - raw, 3); // easeOutCubic
    const hold = THREE.MathUtils.clamp((progress - 0.8) / 0.2, 0, 1);

    const clock = state.clock.elapsedTime;
    const gx = allowTilt ? pointer.x * 0.42 : 0;
    const gy = allowTilt ? pointer.y * 0.3 : 0;

    for (let i = 0; i < count; i++) {
      const a = agents[i];
      const target = targets[a.stage];

      // Per-agent staggered start, clamped so the last agent always lands.
      const agentT = THREE.MathUtils.clamp((resolve - a.delay) / (1 - a.delay), 0, 1);
      const eased = 1 - Math.pow(1 - agentT, 3);

      // Scatter position, alive with drift.
      const drift = paused ? 0 : 1;
      const scatterX =
        a.scatter.x + Math.sin(clock * 0.24 * a.wobble + a.phase) * 0.55 * drift;
      const scatterY =
        a.scatter.y + Math.cos(clock * 0.19 * a.wobble + a.phase * 1.7) * 0.55 * drift;
      const scatterZ = a.scatter.z + Math.sin(clock * 0.15 + a.phase) * 0.4 * drift;

      // Ring position: agent orbits its stage, so the ring pulses.
      const breathe = paused ? 0 : 1;
      const ang = clock * 0.28 * breathe + a.phase;
      tmpTarget.set(
        target.x + Math.cos(ang) * a.orbit,
        target.y + Math.sin(ang) * a.orbit,
        target.z + Math.sin(ang * 0.7) * a.orbit * 0.8,
      );

      // Interpolate scatter → ring.
      tmp.set(
        THREE.MathUtils.lerp(scatterX, tmpTarget.x, eased),
        THREE.MathUtils.lerp(scatterY, tmpTarget.y, eased),
        THREE.MathUtils.lerp(scatterZ, tmpTarget.z, eased),
      );

      const i3 = i * 3;
      positions[i3] = tmp.x + gx;
      positions[i3 + 1] = tmp.y + gy;
      positions[i3 + 2] = tmp.z;

      /*
       * Colour tells the story: ink while scattered (undirected), signal
       * orange as it locks in (aimed), and the ring itself brightens in hold.
       * One accent colour, used only where it means something.
       */
      const base = eased < 0.5 ? INK : SIGNAL;
      const lift = eased * hold;
      col.setRGB(
        base.r + (PAPER.r - base.r) * lift * 0.28,
        base.g + (PAPER.g - base.g) * lift * 0.28,
        base.b + (PAPER.b - base.b) * lift * 0.28,
      );
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;
    }

    const geom = pts.geometry;
    geom.attributes.position.needsUpdate = true;
    geom.attributes.color.needsUpdate = true;

    // Fade the whole cloud in as it enters, so it never pops.
    const mat = pts.material as THREE.PointsMaterial;
    mat.opacity = THREE.MathUtils.clamp(progress * 2.4, 0, 1) * 0.95;

    // The ring connector only exists once the ring is legible.
    ringLine.rotation.z = paused ? 0 : clock * 0.045;
    ringLine.position.x = gx;
    ringLine.position.y = gy;
    const ringMat = ringLine.material as THREE.LineBasicMaterial;
    ringMat.opacity = THREE.MathUtils.clamp((resolve - 0.45) / 0.4, 0, 1) * 0.7;
  });

  // Release GPU resources owned by this scene on unmount.
  useEffect(() => {
    return () => {
      ringLine.geometry.dispose();
      (ringLine.material as THREE.Material).dispose();
    };
  }, [ringLine]);

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
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
          size={0.22}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.NormalBlending}
        />
      </points>

      <primitive object={ringLine} />
    </group>
  );
}

/** Scratch colour, hoisted so the render loop allocates nothing. */
const col = new THREE.Color();
