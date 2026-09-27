"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { site, loopSteps } from "@/content/site";
import { useClock, useReducedMotion } from "@/lib/useClock";
import { getMotionPrefs } from "@/lib/capability";

/**
 * The hero.
 *
 * Opener: hard typographic statement on paper, with a lightweight agent swarm
 * behind it. Restrained on purpose — this is the orientation beat, and the
 * big 3D moments come later. The swarm is a hint, not the show.
 */

const HeroScene = dynamic(
  () =>
    import("@/components/three/HeroScene").then((m) => m.HeroSceneInner),
  { ssr: false, loading: () => null },
);

/** The permanent static composition behind the hero swarm. */
function HeroPoster() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 grid-paper"
      style={{
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 70% 60% at 50% 45%, #000 40%, transparent 100%)",
      }}
    />
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [canRender, setCanRender] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const prefs = getMotionPrefs();
    setCanRender(!prefs.reduced);
    // Defer mount so first paint is never blocked by the 3D chunk.
    const id = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Parallax: the headline drifts up slightly slower than the page.
  useClock((s) => {
    const el = ref.current;
    if (!el || reduced) return;
    // Subtle and bounded — never more than ~40px of travel.
    const drift = Math.min(1, s.scroll * 6) * 40;
    el.style.setProperty("--hero-drift", `${drift}px`);
  });

  return (
    <section
      ref={ref}
      id="top"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b-[2.5px] border-ink"
    >
      <HeroPoster />

      {/* Swarm layer — enhancement only. */}
      {mounted && canRender && (
        <div className="absolute inset-0" aria-hidden="true">
          <HeroScene reduced={reduced} />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-28 pb-16 sm:px-8">
        <p className="t-mono mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-ink/60">
          <span className="chip chip-signal">{site.role}</span>
          <span>{site.location}</span>
          <span aria-hidden="true">·</span>
          <span>Available for ambitious work</span>
        </p>

        {/* Line-masked reveal. The text is real, selectable, and readable
            with JS disabled — the mask is purely additive. */}
        <h1 className="t-display max-w-[16ch]">
          <span className="reveal-line" data-revealed="true">
            <span
              className="reveal-inner"
              style={{ transitionDelay: "80ms" }}
            >
              I build
            </span>
          </span>
          <span className="reveal-line" data-revealed="true">
            <span className="reveal-inner" style={{ transitionDelay: "180ms" }}>
              software
            </span>
          </span>
          <span className="reveal-line" data-revealed="true">
            <span
              className="reveal-inner text-signal"
              style={{ transitionDelay: "280ms" }}
            >
              with agents.
            </span>
          </span>
        </h1>

        <p className="t-body-lg t-measure mt-8 max-w-[54ch] text-ink/75">
          {site.subTagline} {site.description}
        </p>

        {/* The loop, as a flat 2D rail. This is the site's motif and it is
            readable with no JavaScript and no 3D at all. */}
        <ol
          className="mt-12 flex flex-wrap items-stretch gap-1.5"
          aria-label="The build loop"
        >
          {loopSteps.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className="chip border-ink/25 text-ink/70">
                <span className="text-signal">{s.index}</span> {s.label}
              </span>
              {i < loopSteps.length - 1 && (
                <span aria-hidden="true" className="text-ink/30">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <a href="#work" className="btn btn-primary">
            See the work
          </a>
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="btn">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
