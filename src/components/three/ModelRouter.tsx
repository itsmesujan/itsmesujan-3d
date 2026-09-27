"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * SCENE 3 — THE MODEL ROUTER (DevPilot)
 *
 * Concept: one device, two destinations. Requests leave the handset and are
 * routed either to a cloud provider cluster or to a local GGUF runtime.
 *
 * The visitor's control is a real routing parameter — LOCAL ↔ CLOUD — and
 * the consequence is spatial: packets physically travel a different path and
 * land on a different cluster. Dragging the slider is not a label change,
 * it is watching traffic choose a route. That is the whole thesis of DevPilot
 * in one gesture.
 */

const PAPER = new THREE.Color("#f4f1ea");
const INK = new THREE.Color("#0a0a0a");
const CLOUD = new THREE.Color("#ff4d1c");
const LOCAL = new THREE.Color("#00e07a");

type RouterProps = {
  /** 0 = fully local (offline), 1 = fully cloud. */
  route: number;
  paused: boolean;
  allowTilt: boolean;
  pointer: { x: number; y: number };
  /** Scroll progress, used for camera push-in. */
  progress: number;
  /** Packet budget. */
  packetCount: number;
};

export function ModelRouter({
  route,
  paused,
  allowTilt,
  pointer,
  progress,
  packetCount,
}: RouterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const packetRef = useRef<THREE.InstancedMesh>(null);
  const localRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Group>(null);

  const tmpObj = useMemo(() => new THREE.Object3D(), []);
  const tmpColor = useMemo(() => new THREE.Color(), []);

  /** Two destinations: local runtime below, cloud cluster above. */
  const LOCAL_POS = useMemo(() => new THREE.Vector3(0, -1.7, 0), []);
  const CLOUD_POS = useMemo(() => new THREE.Vector3(0, 1.9, -0.4), []);

  useFrame((state) => {
    const clock = state.clock.elapsedTime;
    const t = paused ? 0 : clock;
    const packets = packetRef.current;
    if (!packets) return;

    // Camera pushes in slightly as the section is read.
    const push = 0.9 - progress * 0.9;
    const gx = allowTilt ? pointer.x * 0.5 : 0;
    const gy = allowTilt ? pointer.y * 0.34 : 0;

    const g = groupRef.current;
    if (g) {
      g.position.x = THREE.MathUtils.lerp(g.position.x, gx, 0.07);
      g.position.y = THREE.MathUtils.lerp(g.position.y, gy, 0.07);
      g.position.z = THREE.MathUtils.lerp(g.position.z, push, 0.05);
    }

    // Destinations breathe; the active one blooms.
    const localMat = localRef.current?.material as THREE.MeshStandardMaterial;
    if (localMat) {
      const active = 1 - route;
      localMat.emissiveIntensity = 0.5 + active * 1.5 + Math.sin(t * 2.2) * 0.14 * active;
      localMat.color.copy(LOCAL).lerp(INK, 1 - active * 0.7);
      localMat.emissive.copy(LOCAL);
      localRef.current?.scale.setScalar(1 + active * 0.16 + Math.sin(t * 2) * 0.03);
    }

    if (cloudRef.current) {
      const active = route;
      cloudRef.current.scale.setScalar(1 + active * 0.12 + Math.sin(t * 1.6) * 0.02);
      cloudRef.current.children.forEach((c) => {
        const m = (c as THREE.Mesh).material as THREE.MeshStandardMaterial;
        m.emissiveIntensity = 0.4 + active * 1.2;
      });
    }

    /*
     * Packets spawn at the handset, arc outward, then land on whichever
     * destination the route parameter selects. Each packet has its own phase
     * and speed so the flow reads as traffic, not a conga line.
     */
    for (let i = 0; i < packetCount; i++) {
      const seed = (i * 0.618) % 1; // golden-ratio stagger
      const speed = 0.22 + ((i * 7) % 11) * 0.012;
      let life = (t * speed + seed) % 1;

      // Reduced motion should not erase meaning: freeze at mid-flight.
      if (paused) life = 0.5;

      // Deterministic jitter so packets don't overlap.
      const jitter = (((i * 13) % 17) / 17 - 0.5) * 1.1;
      const jitter2 = (((i * 19) % 23) / 23 - 0.5) * 0.8;

      const dest = tmpObj.position.copy(LOCAL_POS).lerp(CLOUD_POS, route);

      // Quadratic arc from handset (origin) to destination.
      const arcLift = 0.9 + Math.sin(life * Math.PI) * 0.7;
      const x = dest.x * life + jitter * Math.sin(life * Math.PI);
      const y = dest.y * life + arcLift * Math.sin(life * Math.PI);
      const z = dest.z * life + jitter2 * Math.sin(life * Math.PI);

      const scale = Math.sin(life * Math.PI) * 0.9 + 0.1;
      tmpObj.position.set(x, y, z);
      tmpObj.scale.setScalar(0.05 * scale + 0.012);
      tmpObj.updateMatrix();
      packets.setMatrixAt(i, tmpObj.matrix);

      // Packets take the colour of their route.
      tmpColor.copy(LOCAL).lerp(CLOUD, route);
      packets.setColorAt(i, tmpColor);
    }

    packets.instanceMatrix.needsUpdate = true;
    if (packets.instanceColor) packets.instanceColor.needsUpdate = true;
    const mat = packets.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.9;

    void PAPER;
    void INK;
  });

  return (
    <group ref={groupRef}>
      {/* The handset — a simple slab, read as a device not a product shot. */}
      <mesh position={[0, -0.3, 1.1]} rotation={[0, 0, 0]}>
        <boxGeometry args={[1.05, 1.9, 0.09]} />
        <meshStandardMaterial
          color={INK}
          emissive={SIGNAL_SOFT}
          emissiveIntensity={0.25}
          roughness={0.35}
          metalness={0.5}
        />
      </mesh>
      {/* Screen glow, so the device reads as active. */}
      <mesh position={[0, -0.3, 1.06]}>
        <planeGeometry args={[0.92, 1.72]} />
        <meshBasicMaterial color="#ff4d1c" transparent opacity={0.16} />
      </mesh>

      {/* Local GGUF runtime — the on-device destination. */}
      <mesh ref={localRef} position={LOCAL_POS}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshStandardMaterial
          color={LOCAL}
          emissive={LOCAL}
          emissiveIntensity={0.8}
          roughness={0.3}
          flatShading
        />
      </mesh>

      {/* Cloud cluster — multiple spheres = many providers, not one vendor. */}
      <group ref={cloudRef} position={CLOUD_POS}>
        {[
          [0, 0, 0],
          [0.55, 0.3, 0.1],
          [-0.5, 0.35, -0.15],
          [0.15, -0.5, 0.2],
          [-0.35, -0.4, -0.1],
        ].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]}>
            <sphereGeometry args={[0.24, 18, 14]} />
            <meshStandardMaterial
              color={CLOUD}
              emissive={CLOUD}
              emissiveIntensity={0.7}
              roughness={0.45}
            />
          </mesh>
        ))}
      </group>

      {/* Packet stream, instanced — one draw call for all traffic. */}
      <instancedMesh ref={packetRef} args={[undefined, undefined, packetCount]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshBasicMaterial transparent opacity={0.9} />
      </instancedMesh>
    </group>
  );
}

const SIGNAL_SOFT = new THREE.Color("#ff4d1c");
