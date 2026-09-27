"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import SceneHost from "@/components/three/SceneHost";
import { SelfHealingDag } from "@/components/three/SelfHealingDag";
import { getProject, verificationLevels } from "@/content/site";

/** Throws at build time if this slug ever leaves the content. */
const project = getProject("agent-x");

/**
 * SECTION 2 — THE SELF-HEALING DAG (Agent-X)
 *
 * This section carries a real interaction: inject a fault and watch the graph
 * route around it. The control changes the scene spatially — a node dies, its
 * edges sever, a detour lights up — which is the only honest way to
 * demonstrate what "self-healing scheduler" means.
 */

export default function DagSection({ embed = false }: { embed?: boolean }) {
  /**
   * How many faults the visitor has injected. The count is both the scene's
   * React key and its `initialFault` prop, so every injection replays the
   * sequence from t=0, and 0 renders the graph healthy again.
   */
  const [faults, setFaults] = useState(0);

  const inject = useCallback(() => setFaults((n) => n + 1), []);
  const reset = useCallback(() => setFaults(0), []);

  const poster = (
    <div className="absolute inset-0 grid-paper" aria-hidden="true" />
  );

  return (
    <SceneHost
      label="Agent-X: a self-healing mission DAG that repairs itself"
      poster={poster}
      minHeight="min-h-[230vh]"
      camera={{ position: [0, 0, 7.6], fov: 44 }}
      scene={({ progress, paused, allowTilt, pointer, nodes }) => (
        <SelfHealingDag
          key={faults}
          progress={progress}
          paused={paused}
          allowTilt={allowTilt}
          pointer={pointer}
          nodeBudget={nodes}
          initialFault={faults > 0}
        />
      )}
      overlay={({ progress, off }) => (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr] lg:items-center">
          <div>
            <p className="t-mono mb-4 text-ink/55">02 — Evidence</p>
            <h2 className="t-section">
              It <span className="text-signal">heals</span> itself.
            </h2>
            <p className="t-measure mt-5 text-ink/75">
              {project.summary}
            </p>

            <div className="brut mt-7 bg-paper/95 p-4 md:backdrop-blur-sm">
              <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/55">
                Try it
              </p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/70">
                Break the busiest node. The scheduler detects the failure and
                routes around it — no human in the loop.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={inject}
                  disabled={off}
                  className="btn btn-sm btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {faults === 0 ? "Inject fault" : "Replay fault"}
                </button>
                {faults > 0 && (
                  <button
                    type="button"
                    onClick={reset}
                    disabled={off}
                    className="btn btn-sm w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Reset graph
                  </button>
                )}
              </div>

              {/* The fault is a real scene event. When 3D is off entirely —
                  reduced motion or a failed context — say so rather than let
                  the control look broken. */}
              {off && (
                <p className="mt-3 font-mono text-[0.68rem] uppercase leading-relaxed tracking-[0.06em] text-ink/50">
                  Live demo needs WebGL and full motion.
                </p>
              )}

              {/* Announced, not merely implied. */}
              {faults > 0 && (
                <p role="status" className="sr-only">
                  Fault {faults} injected. The scheduler detected the failure and
                  rerouted the mission around it.
                </p>
              )}
            </div>
          </div>

          {/* The result metrics, revealed as the graph resolves. */}
          <div className="brut bg-paper/95 p-5 md:backdrop-blur-sm sm:p-6">
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/55">
              What shipped
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5">
              {(project.metrics ?? []).map((m, i) => {
                const k = Math.min(1, Math.max(0, (progress - 0.35 - i * 0.1) * 7));
                return (
                  <div
                    key={m.label}
                    style={{ opacity: 0.3 + k * 0.7 }}
                  >
                    <dd className="font-display text-3xl font-black leading-none tracking-tight text-signal sm:text-4xl">
                      {m.value}
                    </dd>
                    <dt className="mt-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink">
                      {m.label}
                    </dt>
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.06em] text-ink/50">
                      {m.note}
                    </p>
                  </div>
                );
              })}
            </dl>

            <div className="mt-6 border-t border-ink/15 pt-4">
              <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/55">
                4-level evidence verification
              </p>
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {verificationLevels.map((v, i) => (
                  <li
                    key={v}
                    className="chip border-ink/25 text-ink/70"
                    style={{
                      opacity: 0.4 + Math.min(1, Math.max(0, (progress - 0.5 - i * 0.06) * 8)) * 0.6,
                    }}
                  >
                    {v}
                  </li>
                ))}
              </ul>
            </div>

            {!embed && (
              <Link href={`/work/${project.slug}`} className="btn btn-sm mt-6">
                Read the case study
              </Link>
            )}
          </div>
        </div>
      )}
    />
  );
}
