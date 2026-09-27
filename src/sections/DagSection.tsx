"use client";

import { useCallback, useState } from "react";
import SceneHost from "@/components/three/SceneHost";
import { SelfHealingDag } from "@/components/three/SelfHealingDag";
import { verificationLevels, type Project } from "@/content/site";
import { projects } from "@/content/site";

const project = projects.find((p) => p.slug === "agent-x") as Project;

/**
 * SECTION 2 — THE SELF-HEALING DAG (Agent-X)
 *
 * This section carries a real interaction: inject a fault and watch the graph
 * route around it. The control changes the scene spatially — a node dies, its
 * edges sever, a detour lights up — which is the only honest way to
 * demonstrate what "self-healing scheduler" means.
 */

export default function DagSection() {
  const [faults, setFaults] = useState(0);

  const inject = useCallback(() => setFaults((n) => n + 1), []);

  /** Remounting the scene replays the fault from t=0. */
  const poster = (
    <div className="absolute inset-0 grid-paper" aria-hidden="true" />
  );

  return (
    <SceneHost
      label="Agent-X: a self-healing mission DAG that repairs itself"
      poster={poster}
      minHeight="min-h-[230vh]"
      camera={{ position: [0, 0, 7.6], fov: 44 }}
      scene={({ progress, paused, allowTilt, pointer, count }) => (
        <SelfHealingDag
          key={faults}
          progress={progress}
          paused={paused}
          allowTilt={allowTilt}
          pointer={pointer}
          nodeBudget={count}
        />
      )}
      overlay={({ progress }) => (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr] lg:items-center">
          <div>
            <p className="t-mono mb-4 text-ink/55">02 — Evidence</p>
            <h2 className="t-section">
              It <span className="text-signal">heals</span> itself.
            </h2>
            <p className="t-measure mt-5 text-ink/75">
              {project.summary}
            </p>

            <div className="brut mt-7 bg-paper/92 p-4 backdrop-blur-sm">
              <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/55">
                Try it
              </p>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/70">
                Break the busiest node. The scheduler detects the failure and
                routes around it — no human in the loop.
              </p>
              <div className="pointer-events-auto mt-4">
                <button
                  type="button"
                  onClick={inject}
                  className="btn btn-sm btn-primary w-full sm:w-auto"
                >
                  Inject fault
                </button>
              </div>
            </div>
          </div>

          {/* The result metrics, revealed as the graph resolves. */}
          <div className="brut bg-paper/92 p-5 backdrop-blur-sm sm:p-6">
            <p className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/55">
              What shipped
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5">
              {[
                { v: "94.5%", k: "Mission success", note: "vs 42% baseline" },
                { v: "91.2%", k: "Self-healing recovery", note: "no intervention" },
                { v: "87.5%", k: "Cost reduction", note: "per mission" },
                { v: "162/162", k: "Test suite", note: "passing" },
              ].map((m, i) => {
                const k = Math.min(1, Math.max(0, (progress - 0.35 - i * 0.1) * 7));
                return (
                  <div
                    key={m.k}
                    style={{ opacity: 0.3 + k * 0.7 }}
                  >
                    <dd className="font-display text-3xl font-black leading-none tracking-tight text-signal sm:text-4xl">
                      {m.v}
                    </dd>
                    <dt className="mt-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-ink">
                      {m.k}
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

            <a
              href={`/work/${project.slug}`}
              className="btn btn-sm mt-6 pointer-events-auto"
            >
              Read the case study
            </a>
          </div>
        </div>
      )}
    />
  );
}
