"use client";

import SceneHost from "@/components/three/SceneHost";
import { AgentSwarm } from "@/components/three/AgentSwarm";
import { loopSteps } from "@/content/site";

/**
 * SECTION 1 — THE AGENT FLEET
 * Scroll: a scattered cloud is recruited into the six stages of the build loop.
 */

export default function FleetSection() {
  /** The static composition — a legible 2D version of the same idea. */
  const poster = (
    <div className="absolute inset-0 grid-paper" aria-hidden="true" />
  );

  return (
    <SceneHost
      id="method"
      label="The agent fleet resolving into the six-stage build loop"
      poster={poster}
      minHeight="min-h-[240vh]"
      camera={{ position: [0, 0, 6.2], fov: 46 }}
      budget={(tier) => TIER_PARTICLE[tier]}
      scene={({ progress, paused, allowTilt, pointer, count }) => (
        <AgentSwarm
          progress={progress}
          count={count}
          paused={paused}
          allowTilt={allowTilt}
          pointer={pointer}
        />
      )}
      overlay={({ progress, reveal }) => (
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,26rem)] lg:items-center">
          <div>
            <p className="t-mono mb-4 text-ink/55">
              01 — Method
            </p>
            <h2 className="t-section max-w-[14ch]">
              One human.{" "}
              <span className="text-signal">A fleet.</span>
            </h2>
            <p className="t-measure mt-6 text-ink/75">
              A fleet of agents is undirected by nature — it drifts, duplicates
              work, and wanders off-goal. The job is not to code faster. The
              job is to aim it. Scroll to recruit the swarm into the loop.
            </p>
          </div>

          {/* The six stages, revealed in sync with the resolve. */}
          <ol className="brut-lg bg-paper/92 p-5 backdrop-blur-sm sm:p-6">
            {loopSteps.map((s, i) => {
              // Each stage lights as the ring reaches it.
              const stageProgress = Math.min(
                1,
                Math.max(0, (progress - 0.28 - i * 0.085) * 9),
              );
              return (
                <li
                  key={s.id}
                  className="flex gap-4 border-b border-ink/15 py-3.5 last:border-b-0 last:pb-0 first:pt-0"
                  style={{
                    opacity: 0.35 + stageProgress * 0.65,
                    transform: `translateX(${(1 - stageProgress) * -10}px)`,
                    transition: "transform 0.3s var(--ease-out-expo)",
                  }}
                >
                  <span
                    className="font-mono text-[0.72rem] font-bold tabular-nums"
                    style={{
                      color: stageProgress > 0.5 ? "var(--color-signal)" : undefined,
                    }}
                  >
                    {s.index}
                  </span>
                  <div>
                    <p className="font-display text-lg font-black uppercase leading-none tracking-tight">
                      {s.label}
                    </p>
                    <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ink/70">
                      {s.line}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    />
  );
}

/** Mirrors the tier budget; the swarm is the heaviest scene. */
const TIER_PARTICLE = { low: 300, balanced: 750, high: 1400 } as const;
