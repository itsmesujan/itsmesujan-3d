"use client";

import { useEffect, useRef, useState } from "react";
import { type Tier, getMotionPrefs } from "./capability";

/**
 * One shared clock for scroll progress, pointer, and page visibility.
 *
 * Every animated property on the page has exactly one owner reading from here,
 * so nothing fights over the same transform. Consumers subscribe; we do the
 * sampling, normalization, and cleanup once.
 */

type Sample = {
  /** Document scroll progress 0–1 */
  scroll: number;
  /** Signed scroll direction, -1 up / 1 down / 0 settled */
  scrollDir: number;
  /** Raw pointer axes, normalized to -1–1 */
  pointerX: number;
  pointerY: number;
  /** True when the tab is visible */
  visible: boolean;
};

type Clock = Sample & {
  subscribe: (fn: (s: Sample) => void) => () => void;
  get: () => Sample;
};

const clock: Clock = {
  scroll: 0,
  scrollDir: 0,
  pointerX: 0,
  pointerY: 0,
  visible: true,
  subscribe: () => () => {},
  get: () => clock,
};

const subs = new Set<(s: Sample) => void>();
let lastScroll = 0;
let rafId = 0;
let running = false;

function sample() {
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  const y = window.scrollY || doc.scrollTop || 0;
  const next = Math.min(1, Math.max(0, y / max));

  const delta = y - lastScroll;
  if (Math.abs(delta) > 2) {
    clock.scrollDir = delta > 0 ? 1 : -1;
    lastScroll = y;
  } else {
    // Settle to neutral so velocity effects don't stick.
    clock.scrollDir *= 0.8;
    if (Math.abs(clock.scrollDir) < 0.05) clock.scrollDir = 0;
  }

  clock.scroll = next;
  for (const fn of subs) fn(clock);
}

function startLoop() {
  if (running) return;
  running = true;
  const tick = () => {
    sample();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

function stopLoop() {
  if (!running) return;
  running = false;
  cancelAnimationFrame(rafId);
}

function initClock() {
  if (typeof window === "undefined") return;
  clock.subscribe = (fn) => {
    subs.add(fn);
    fn(clock);
    startLoop();
    return () => {
      subs.delete(fn);
      if (subs.size === 0) stopLoop();
    };
  };

  window.addEventListener("scroll", sample, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      clock.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      clock.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    clock.visible = !document.hidden;
    // Pause the clock entirely while hidden so nothing jumps on return.
    if (clock.visible) {
      lastScroll = window.scrollY;
      startLoop();
    } else {
      stopLoop();
    }
  });
  startLoop();
}

let clockReady = false;
export function ensureClock() {
  if (typeof window === "undefined" || clockReady) return clock;
  clockReady = true;
  initClock();
  return clock;
}

/**
 * Subscribe to the shared clock. One rAF-driven source for the whole page.
 * Returns the unsubscribe function so callers can clean up precisely.
 */
export function useClock(fn: (s: Sample) => void) {
  const ref = useRef(fn);
  ref.current = fn;
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const c = ensureClock();
    unsubRef.current = c.subscribe((s) => ref.current(s));
    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, []);

  return () => {
    unsubRef.current?.();
    unsubRef.current = null;
  };
}

/**
 * Adaptive quality tier.
 *
 * Starts from a capability guess, then corrects on measured frame behaviour:
 * two slow 1s windows demote, five stable seconds promote, and repeated
 * reversals lock the tier low so it stops oscillating.
 */
export function usePerfTier(base: Tier) {
  const [tier, setTier] = useState<Tier>(base);
  const lockRef = useRef(false);

  useEffect(() => {
    let slowWindows = 0;
    let stableWindows = 0;
    let reversals = 0;
    let last = performance.now();
    let raf = 0;
    let current = base;

    const loop = (now: number) => {
      const dt = now - last;
      last = now;

      // Ignore background/tab-suspended gaps.
      if (dt < 500) {
        if (dt > 34) {
          slowWindows += dt / 1000;
          stableWindows = 0;
        } else {
          stableWindows += dt / 1000;
        }

        if (slowWindows > 2) {
          slowWindows = 0;
          if (current === "high") current = "balanced";
          else if (current === "balanced") current = "low";
          else lockRef.current = true;
          setTier(current);
          reversals += 1;
          // Oscillation guard: give up on promoting after repeated demotions.
          if (reversals >= 2) lockRef.current = true;
        }

        if (stableWindows > 5 && !lockRef.current && current === "balanced") {
          stableWindows = 0;
          current = "high";
          setTier(current);
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [base]);

  return tier;
}

/** Live reduced-motion preference, reacting to changes mid-session. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** One-shot enter animations driven by IntersectionObserver. */
export function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.setAttribute("data-revealed", "true");
            io.unobserve(el);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return ref;
}

/** True once the element has entered — for one-time scene activation. */
export function useInView<T extends HTMLElement>(rootMargin = "200px") {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, seen };
}
