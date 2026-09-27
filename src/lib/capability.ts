/**
 * Capability + preference detection.
 *
 * The whole 3D layer is an enhancement. Every one of these checks can return
 * "unavailable" and the page must still be complete, readable, and actionable.
 */

export type MotionPrefs = {
  reduced: boolean;
  finePointer: boolean;
  coarsePointer: boolean;
};

export function getMotionPrefs(): MotionPrefs {
  if (typeof window === "undefined") {
    return { reduced: false, finePointer: false, coarsePointer: false };
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return { reduced, finePointer, coarsePointer };
}

/** True only when the browser can actually run WebGL2. */
export function hasWebGL2(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    // Release immediately; we only probed.
    const lose = gl.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/**
 * Quality tier from real capability signals.
 *
 * Deliberately conservative: a single browser hint is not proof of GPU class,
 * so this starts low-risk and is corrected by measured frame behaviour at
 * runtime (see usePerfTier).
 */
export type Tier = "low" | "balanced" | "high";

export function initialTier(): Tier {
  if (typeof window === "undefined") return "balanced";
  if (hasWebGL2() === false) return "low";

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (typeof mem === "number" && mem <= 4) return "low";

  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;

  if (coarse || small || cores <= 4) return "balanced";
  if (cores >= 8) return "high";
  return "balanced";
}

/** Per-tier budgets. Real numbers the scenes actually read. */
export const TIER_BUDGET: Record<
  Tier,
  {
    dpr: [number, number];
    particleCount: number;
    nodeCount: number;
    shadows: boolean;
    bloom: boolean;
    antialias: boolean;
  }
> = {
  low: {
    dpr: [1, 1],
    particleCount: 220,
    nodeCount: 7,
    shadows: false,
    bloom: false,
    antialias: false,
  },
  balanced: {
    dpr: [1, 1.25],
    particleCount: 520,
    nodeCount: 10,
    shadows: true,
    bloom: false,
    antialias: true,
  },
  high: {
    dpr: [1, 1.5],
    particleCount: 1100,
    nodeCount: 14,
    shadows: true,
    bloom: true,
    antialias: true,
  },
};
