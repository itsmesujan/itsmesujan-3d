"use client";

import { useState } from "react";
import Link from "next/link";
import SceneHost from "@/components/three/SceneHost";
import { ModelRouter } from "@/components/three/ModelRouter";
import { getProject } from "@/content/site";

/** Throws at build time if this slug ever leaves the content. */
const project = getProject("devpilot");

/**
 * SECTION 3 — THE MODEL ROUTER (DevPilot)
 *
 * The visitor's control is a real routing parameter. Dragging LOCAL ↔ CLOUD
 * sends the packet stream down a different path to a different destination —
 * a spatial consequence, not a label change. This is the same tradeoff the
 * app makes on-device, expressed in one gesture.
 */

export default function RouterSection({ embed = false }: { embed?: boolean }) {
  const [route, setRoute] = useState(0.5);

  // The slider is the only input; the scene reads it live.
  const onRoute = (v: number) => setRoute(v);

  const localPct = Math.round((1 - route) * 100);
  const cloudPct = 100 - localPct;

  const poster = (
    <div className="absolute inset-0 grid-paper" aria-hidden="true" />
  );

  return (
    <SceneHost
      label="DevPilot: routing AI requests between local models and cloud providers"
      poster={poster}
      minHeight="min-h-[220vh]"
      camera={{ position: [0, 0, 6.8], fov: 45 }}
      budget={(tier) => (tier === "high" ? 120 : tier === "balanced" ? 70 : 40)}
      scene={({ progress, paused, allowTilt, pointer, count }) => (
        <ModelRouter
          route={route}
          progress={progress}
          paused={paused}
          allowTilt={allowTilt}
          pointer={pointer}
          packetCount={count}
        />
      )}
      overlay={({ progress }) => (
        <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,25rem)] lg:items-center">
          <div>
            <p className="t-mono mb-4 text-ink/55">03 — The build</p>
            <h2 className="t-section max-w-[13ch]">
              Local or cloud. <span className="text-signal">Your call.</span>
            </h2>
            <p className="t-measure mt-5 text-ink/75">
              Every AI assistant makes this choice for you. DevPilot doesn&apos;t.
              Route a request to a local model for privacy and zero latency, or
              to a cloud provider for frontier capability — one app, both paths.
            </p>
          </div>

          {/* The control surface. Native range input = free keyboard support. */}
          <div className="brut bg-paper/95 p-5 md:backdrop-blur-sm sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <label
                htmlFor="route-slider"
                className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/55"
              >
                Route traffic
              </label>
              <span className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.08em] tabular-nums text-ink/70">
                {localPct}% local / {cloudPct}% cloud
              </span>
            </div>

            <div className="mt-4">
              <input
                id="route-slider"
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(route * 100)}
                onChange={(e) => onRoute(Number(e.target.value) / 100)}
                aria-label="Percentage of requests routed to local models instead of cloud providers"
                aria-valuetext={`${localPct} percent local, ${cloudPct} percent cloud`}
                className="w-full cursor-pointer appearance-none rounded-none accent-signal"
                style={{
                  // A thick visible track, so the control still has a real
                  // hit area even though the painted rail is only 10px.
                  background: `linear-gradient(to right, var(--color-verify) ${route * 100}%, var(--color-signal) ${route * 100}%)`,
                  height: 10,
                }}
              />
              <div className="mt-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-[0.1em]">
                <span style={{ color: "var(--color-verify)" }}>◀ Local GGUF</span>
                <span style={{ color: "var(--color-signal)" }}>Cloud providers ▶</span>
              </div>
            </div>

            <dl className="mt-6 space-y-3 border-t border-ink/15 pt-5">
              {[
                { k: "Local runtime", v: "60+ GGUF models · llama.cpp + Vulkan" },
                { k: "Cloud", v: "10+ providers · streaming" },
                { k: "Shipped as", v: "64.8 MB release APK" },
              ].map((row, i) => (
                <div
                  key={row.k}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                  style={{
                    opacity: 0.4 + Math.min(1, Math.max(0, (progress - 0.3 - i * 0.08) * 7)) * 0.6,
                  }}
                >
                  <dt className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.1em] text-ink">
                    {row.k}
                  </dt>
                  <dd className="font-mono text-[0.72rem] text-ink/65">{row.v}</dd>
                </div>
              ))}
            </dl>

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
