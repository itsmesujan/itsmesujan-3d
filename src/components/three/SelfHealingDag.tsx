"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * SCENE 2 — THE SELF-HEALING DAG
 *
 * Concept: a mission graph that fails and repairs itself. This is Agent-X
 * made visible — a scheduled DAG where a node fails, the failure is detected,
 * and a recovery path reconnects without a human.
 *
 * This is the only scene with a real visitor control: an INJECT FAULT button.
 * The interaction requirement is a *spatial* consequence, not a label — a
 * node visibly dies, the path to it is severed, and a new edge is routed
 * around the break. That teaches what "self-healing" means better than any
 * paragraph can.
 */

const INK = "#0a0a0a";
const SIGNAL = "#ff4d1c";
const VERIFY = "#00e07a";
const FAIL = "#ff2d55";

type NodeState = "idle" | "active" | "failed" | "recovered";

type DagProps = {
  progress: number;
  paused: boolean;
  allowTilt: boolean;
  pointer: { x: number; y: number };
  /** How many graph nodes to draw — capped by tier. */
  nodeBudget: number;
  /**
   * Start, or re-start, the fault sequence. The parent owns the state: `true`
   * plays failure → severance → recovery from t=0; `false` returns the graph
   * to healthy.
   */
  initialFault?: boolean;
};

type GraphNode = {
  id: string;
  base: THREE.Vector3;
  size: number;
  /** True for the root / kernel. */
  isRoot: boolean;
};

export function SelfHealingDag({
  progress,
  paused,
  allowTilt,
  pointer,
  nodeBudget,
  initialFault = false,
}: DagProps) {
  const [faultInjected, setFaultInjected] = useState(initialFault);
  const groupRef = useRef<THREE.Group>(null);
  const faultTime = useRef<number | null>(null);

  /*
   * The parent drives the interaction. Re-injecting replays the sequence from
   * t=0 without requiring a remount, and clearing it returns the graph to
   * healthy — the state is a prop here, not a hidden internal toggle.
   */
  useEffect(() => {
    setFaultInjected(initialFault);
    faultTime.current = null;
  }, [initialFault]);

  // Nodes are laid out in layers left→right, the way a scheduler reads.
  const nodes = useMemo<GraphNode[]>(() => {
    const layout: GraphNode[] = [
      { id: "mission", base: new THREE.Vector3(-3.4, 0, 0), size: 0.34, isRoot: true },
      { id: "goal", base: new THREE.Vector3(-2.0, 0.9, 0), size: 0.24, isRoot: false },
      { id: "plan", base: new THREE.Vector3(-2.0, -0.9, 0), size: 0.24, isRoot: false },
      { id: "drain", base: new THREE.Vector3(-0.6, 1.5, 0), size: 0.22, isRoot: false },
      { id: "execute", base: new THREE.Vector3(-0.6, 0.3, 0), size: 0.26, isRoot: false },
      { id: "meter", base: new THREE.Vector3(-0.6, -0.9, 0), size: 0.2, isRoot: false },
      { id: "verify", base: new THREE.Vector3(0.9, 0.8, 0), size: 0.24, isRoot: false },
      { id: "evidence", base: new THREE.Vector3(0.9, -0.5, 0), size: 0.28, isRoot: false },
      { id: "heal", base: new THREE.Vector3(2.4, 1.4, 0), size: 0.2, isRoot: false },
      { id: "drift", base: new THREE.Vector3(2.4, -0.2, 0), size: 0.2, isRoot: false },
      { id: "ship", base: new THREE.Vector3(3.5, 0.4, 0), size: 0.32, isRoot: true },
      { id: "world", base: new THREE.Vector3(1.9, -1.5, 0), size: 0.18, isRoot: false },
    ];
    // The core path (mission → … → verify) survives every budget, so the fault
    // and its recovery are always demonstrable.
    return layout.slice(0, Math.min(layout.length, Math.max(7, nodeBudget)));
  }, [nodeBudget]);

  const index = useMemo(() => {
    const m = new Map<string, number>();
    nodes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [nodes]);

  /*
   * Edges describe the real dependency shape from the Agent-X case study.
   * `faultEdge` is the path a fault severs; `healEdges` route around it.
   */
  const edges = useMemo(() => {
    const pairs: [string, string][] = [
      ["mission", "goal"],
      ["mission", "plan"],
      ["goal", "drain"],
      ["goal", "execute"],
      ["plan", "execute"],
      ["plan", "meter"],
      ["drain", "verify"],
      ["execute", "verify"],
      ["execute", "evidence"],
      ["meter", "drift"],
      ["verify", "ship"],
      ["evidence", "ship"],
      ["drift", "ship"],
      ["verify", "heal"],
      ["heal", "drift"],
      ["evidence", "world"],
    ];
    return pairs
      .map(([a, b]) => [index.get(a), index.get(b)] as [number, number])
      .filter(([a, b]) => a !== undefined && b !== undefined) as [number, number][];
  }, [index]);

  /** The node the fault kills — execute is the busiest path in the graph. */
  const FAULT_NODE = index.get("execute") ?? 4;

  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);

  /*
   * Edges are built as real THREE.Line objects rather than JSX <line>
   * elements: the lowercase tag collides with the SVG intrinsic of the same
   * name, and imperative control over opacity per frame is far simpler on a
   * retained object.
   */
  const { edgeLines, healLines } = useMemo(() => {
    const make = (a: THREE.Vector3, b: THREE.Vector3, lift: number, color: number) => {
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.z += lift;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(curve.getPoints(24)),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false }),
      );
    };

    const made = edges.map(([a, b]) => make(nodes[a].base, nodes[b].base, 0, 0x0a0a0a));

    // The detour around the dead node: the proof the graph repairs itself.
    // A low node budget can trim the tail of the layout, so each route is only
    // built when both of its endpoints were actually drawn.
    const heals: THREE.Line[] = [];
    const route = (from: string, to: string) => {
      const a = index.get(from);
      const b = index.get(to);
      if (a === undefined || b === undefined) return;
      heals.push(make(nodes[a].base, nodes[b].base, 0.5, 0x00e07a));
    };
    route("plan", "meter");
    route("meter", "drift");

    return { edgeLines: made, healLines: heals };
  }, [edges, nodes, index]);

  // Dispose every geometry and material this scene created.
  useEffect(() => {
    const all = [...edgeLines, ...healLines];
    return () => {
      for (const l of all) {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      }
    };
  }, [edgeLines, healLines]);

  useFrame((state) => {
    const clock = state.clock.elapsedTime;
    const t = paused ? 0 : clock;

    // Track when the fault happened so recovery has a start time.
    if (faultInjected && faultTime.current === null) faultTime.current = clock;
    if (!faultInjected) faultTime.current = null;

    const sinceFault = faultTime.current === null ? Infinity : clock - faultTime.current;

    const gx = allowTilt ? pointer.x * 0.3 : 0;
    const gy = allowTilt ? pointer.y * 0.2 : 0;

    for (let i = 0; i < nodes.length; i++) {
      const mesh = nodeRefs.current[i];
      if (!mesh) continue;
      const n = nodes[i];

      let st: NodeState = "idle";
      if (i === FAULT_NODE) {
        // Fails, then visibly recovers once the detour is live.
        st = sinceFault < 0.6 ? "failed" : sinceFault < 1.8 ? "active" : "recovered";
      } else if (faultInjected && sinceFault < 1.2) {
        st = "active";
      } else if (progress > 0.25) {
        // Data flows outward from the root as the section is read.
        st = Math.sin(clock * 1.4 - i * 0.7) > -0.2 ? "active" : "idle";
      }

      const mat = mesh.material as THREE.MeshStandardMaterial;

      if (st === "failed") {
        mat.color.set(FAIL);
        // A failed node jitters — instability you can see.
        // Deterministic waveforms rather than Math.random(): the frame loop
        // allocates nothing, and the same fault always looks the same.
        mesh.position.x = n.base.x + Math.sin(clock * 47.3) * 0.05;
        mesh.position.y = n.base.y + Math.cos(clock * 41.7) * 0.05;
        mesh.scale.setScalar(n.size * 1.25);
      } else {
        mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, n.base.x, 0.12);
        mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, n.base.y, 0.12);
        mesh.position.z = Math.sin(t * 1.1 + i) * 0.07;

        const pulse =
          st === "recovered"
            ? 1.5
            : st === "active"
              ? 1.28 + Math.sin(t * 3 + i) * 0.1
              : 1;
        mesh.scale.setScalar(
          THREE.MathUtils.lerp(mesh.scale.x, n.size * pulse, 0.15),
        );

        if (n.isRoot) {
          mat.color.set(INK);
          mat.emissive.set(SIGNAL);
          mat.emissiveIntensity = 0.5;
        } else if (st === "recovered") {
          mat.color.set(VERIFY);
          mat.emissive.set(VERIFY);
          mat.emissiveIntensity = 0.7;
        } else if (st === "active") {
          mat.color.set(INK);
          mat.emissive.set(SIGNAL);
          mat.emissiveIntensity = 0.42;
        } else {
          mat.color.set(INK);
          mat.emissive.set(INK);
          mat.emissiveIntensity = 0.12;
        }
      }
    }

    // Edges: dim normally, severed red on fault, teal on the recovery detour.
    edgeLines.forEach((line, ei) => {
      const mat = line.material as THREE.LineBasicMaterial;
      // Recover which endpoints this edge connects, to detect fault contact.
      const pair = edges[ei];
      if (!pair) return;
      const touchesFault = pair[0] === FAULT_NODE || pair[1] === FAULT_NODE;

      if (faultInjected && touchesFault && sinceFault < 2.2) {
        const k = sinceFault / 2.2;
        mat.color.set(FAIL);
        mat.opacity = (1 - k) * 0.9;
      } else if (touchesFault && faultInjected) {
        mat.color.set(VERIFY);
        mat.opacity = 0.45 + Math.sin(t * 2.4) * 0.2;
      } else {
        mat.color.set(INK);
        mat.opacity = 0.16 + Math.sin(t * 1.6 - ei * 0.4) * 0.09;
      }
    });

    // Recovery edges fade in only after the detour exists.
    healLines.forEach((line) => {
      const mat = line.material as THREE.LineBasicMaterial;
      const k = THREE.MathUtils.clamp((sinceFault - 0.5) / 0.9, 0, 1);
      mat.opacity = faultInjected ? k * 0.85 : 0;
      mat.color.set(VERIFY);
    });

    const g = groupRef.current;
    if (g) {
      g.position.x = THREE.MathUtils.lerp(g.position.x, gx, 0.06);
      g.position.y = THREE.MathUtils.lerp(g.position.y, gy, 0.06);
      g.rotation.y = t * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <mesh
          key={n.id}
          ref={(m) => {
            nodeRefs.current[i] = m;
          }}
          position={n.base}
          scale={n.size}
        >
          {/* Box nodes read as a technical/schematic object, not an orb. */}
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={INK}
            emissive={INK}
            emissiveIntensity={0.12}
            roughness={0.42}
            metalness={0.15}
          />
        </mesh>
      ))}

      {edgeLines.map((line, i) => (
        <primitive key={`e${i}`} object={line} />
      ))}

      {healLines.map((line, i) => (
        <primitive key={`h${i}`} object={line} />
      ))}
    </group>
  );
}
