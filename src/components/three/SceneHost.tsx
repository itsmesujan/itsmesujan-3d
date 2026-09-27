"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import SceneCanvas from "./SceneCanvas";
import { useClock, usePerfTier, useReducedMotion } from "@/lib/useClock";
import { getMotionPrefs, initialTier, TIER_BUDGET, type Tier } from "@/lib/capability";

/**
 * The shared host for every scroll-driven 3D section.
 *
 * Responsibilities, in order of importance:
 *  1. Decide whether 3D runs at all (capability, motion preference, viewport).
 *  2. Keep the static composition in the DOM at all times as the poster.
 *  3. Map this section's own scroll range to 0–1 progress — measured, not guessed.
 *  4. Own and clean up every listener, observer, and subscription it creates.
 *
 * Geometry is measured on resize and after fonts load, never inside the scroll
 * loop. Progress is read from the page's single shared clock, so all three
 * scenes sample one signal instead of each adding their own listener.
 */

export type SceneContext = {
  /** This section's scroll progress, 0–1. */
  progress: number;
  tier: Tier;
  /** True when motion should stop (reduced motion or scrolled off-screen). */
  paused: boolean;
  allowTilt: boolean;
  pointer: { x: number; y: number };
  /** Particle/packet budget for this tier. */
  count: number;
  /** Graph-node budget for this tier. */
  nodes: number;
  /**
   * True when 3D is permanently off for this visitor — reduced motion, or a
   * context that failed. The poster is the whole experience, so controls that
   * depend on the scene must say so rather than look broken.
   */
  off: boolean;
};

type Props = {
  /** Anchor target, for in-page navigation to this section. */
  id?: string;
  /** Static composition. Shown before load, on no-WebGL, and on failure. */
  poster: ReactNode;
  /** 2D overlay. Receives progress so copy can sync with the scene. */
  overlay: (ctx: SceneContext & { reveal: boolean }) => ReactNode;
  /** 3D scene contents. */
  scene: (ctx: SceneContext) => ReactNode;
  /** Section label for assistive tech. */
  label: string;
  camera?: { position: [number, number, number]; fov?: number };
  minHeight?: string;
  className?: string;
  /** Override the per-tier budget for a specific scene. */
  budget?: (tier: Tier) => number;
};

export default function SceneHost({
  id,
  poster,
  overlay,
  scene,
  label,
  camera = { position: [0, 0, 6.4], fov: 45 },
  minHeight = "min-h-[200vh]",
  className = "",
  budget,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);

  const [progress, setProgress] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [baseTier, setBaseTier] = useState<Tier>("balanced");
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const [antialias, setAntialias] = useState(false);

  const reduced = useReducedMotion();
  const tier = usePerfTier(baseTier);

  // Refs, so the scene render function always reads current values without
  // re-creating the canvas tree on every pointer move.
  const pointer = useRef({ x: 0, y: 0 });
  const allowTilt = useRef(false);

  // 1. Capability + preference, once, on the client.
  useEffect(() => {
    const prefs = getMotionPrefs();
    allowTilt.current = prefs.finePointer && !prefs.reduced;
    setAllowed(!prefs.reduced);

    // One implementation of the capability guess, shared with the rest of the
    // app: WebGL2 availability, memory, cores, pointer type, viewport.
    const t = initialTier();
    setBaseTier(t);

    // Anti-aliasing is a context-creation option, not a runtime toggle. Latch
    // the tier's value here — before any canvas exists — and never rewrite it.
    setAntialias(TIER_BUDGET[t].antialias);

    setReady(true);
  }, []);

  /*
   * Section geometry is measured outside the scroll loop; progress is derived
   * from the shared clock. The subscription must live at the top level of the
   * component — it is a hook, and calling it from inside an effect breaks
   * hook ordering.
   */
  const geometry = useRef({ top: 0, travel: 1 });

  useEffect(() => {
    if (!ready) return;
    const el = sectionRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      geometry.current.top = rect.top + window.scrollY;
      // Travel is the distance the section scrolls while its child is pinned.
      geometry.current.travel = Math.max(1, rect.height - window.innerHeight);
    };

    measure();

    const onResize = () => measure();
    window.addEventListener("resize", onResize, { passive: true });
    // Web fonts change measured height; re-measure once they land.
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => window.removeEventListener("resize", onResize);
  }, [ready]);

  // The single clock subscription, owned and cleaned up by this hook.
  useClock((s) => {
    pointer.current.x = s.pointerX;
    pointer.current.y = s.pointerY;
    const { top, travel } = geometry.current;
    const y = s.scroll * (document.documentElement.scrollHeight - window.innerHeight);
    const next = Math.min(1, Math.max(0, (y - top) / travel));
    setProgress((prev) => (Math.abs(prev - next) > 0.001 ? next : prev));
  });

  // 3. Reveal once, and track whether the section is on screen (GPU gating).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setReveal(true);
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { rootMargin: "300px 0px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const count = budget ? budget(tier) : TIER_BUDGET[tier].particleCount;
  const nodes = TIER_BUDGET[tier].nodeCount;

  /*
   * The canvas mounts once, when the section first comes near view, and then
   * stays mounted. Off-screen it is switched to `frameloop="never"` rather
   * than torn down: no frames are spent on invisible pixels, and scrolling
   * back does not pay for a new renderer, context, shader compile and buffer
   * upload. `inView` still gates that switch, so the effect is identical.
   */
  const showCanvas = allowed && reveal && !failed;

  // True while the canvas is genuinely rendering. Used to gate the frame loop,
  // not passed on: a scene never needs to know it is merely off-screen.
  const live = showCanvas && inView && !reduced;

  // Permanently off, as opposed to momentarily paused.
  const off = ready && (!allowed || failed);

  const ctx: SceneContext = {
    progress,
    tier,
    // Stop the clock when off-screen or when the user asked for less motion.
    paused: reduced || !inView,
    allowTilt: allowTilt.current,
    pointer: pointer.current,
    count,
    nodes,
    off,
  };

  return (
    <section
      ref={sectionRef}
      id={id}
      aria-label={label}
      className={`relative ${minHeight} ${className}`}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {showCanvas ? (
          <SceneCanvas
            fallback={poster}
            camera={camera}
            maxDpr={TIER_BUDGET[tier].dpr[1]}
            shadows={TIER_BUDGET[tier].shadows}
            antialias={antialias}
            frameloop={live ? "always" : "never"}
            onFail={() => setFailed(true)}
          >
            {scene(ctx)}
          </SceneCanvas>
        ) : (
          <div className="absolute inset-0">{poster}</div>
        )}

        {/* 2D content always sits above the scene and is never occluded. */}
        <div className="pointer-events-none relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
            {overlay({ ...ctx, reveal })}
          </div>
        </div>
      </div>
    </section>
  );
}
