"use client";

import Image from "next/image";
import { about, capabilities, now, timeline, site } from "@/content/site";
import { useReveal } from "@/lib/useClock";

/**
 * About + capabilities + current focus.
 *
 * Presented as a 2D section on paper — deliberately quiet after three loud 3D
 * beats. The contrast is the reason the 3D sections read as events.
 */
type Props = {
  /** "h1" when this section is the page's primary content. */
  headingLevel?: "h1" | "h2";
};

export default function About({ headingLevel = "h2" }: Props) {
  const ref = useReveal<HTMLElement>(0.05);
  const Heading = headingLevel;

  return (
    <>
      <section
        ref={ref}
        id="about"
        aria-labelledby="about-heading"
        className={`border-b-[2.5px] border-ink bg-paper-dim pb-20 sm:pb-28 ${
          headingLevel === "h1" ? "page-top" : "pt-20 sm:pt-28"
        }`}
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div>
              <p className="t-mono mb-3 text-ink/55">About</p>
              <Heading id="about-heading" className="t-section mb-6">
                {about.heading}
              </Heading>
              <p className="t-body-lg t-measure text-ink/80">{about.body}</p>
              <p className="t-measure mt-5 text-ink/70">{about.second}</p>

              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm mt-8"
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div className="space-y-8">
              {/* Portrait */}
              <div className="brut bg-paper p-5 sm:p-6">
                <Image
                  src={site.avatar}
                  alt={`Portrait of ${site.name}`}
                  width={96}
                  height={96}
                  className="h-24 w-24 border-[2.5px] border-ink"
                />
                <p className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.1em] text-ink/55">
                  {site.location} · fluent in Japanese &amp; English
                </p>
              </div>

              {/* Short history */}
              <div>
                <h3 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink/50">
                  A short history
                </h3>
                <ol className="mt-4 space-y-0">
                  {timeline.map((t, i) => (
                    <li key={t.year} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-3 w-3 shrink-0 border-2 border-ink"
                          style={{
                            background: i === timeline.length - 1 ? "var(--color-signal)" : "var(--color-paper)",
                          }}
                        />
                        {i < timeline.length - 1 && (
                          <span aria-hidden="true" className="w-0 flex-1 bg-ink/25" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em] text-signal">
                          {t.year}
                        </p>
                        <p className="mt-1 text-[0.94rem] leading-relaxed text-ink/75">
                          {t.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section
        id="capabilities"
        aria-labelledby="capabilities-heading"
        className="border-b-[2.5px] border-ink bg-ink py-20 text-paper sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="t-mono mb-3 text-paper/50">Capabilities</p>
          <h2 id="capabilities-heading" className="t-section mb-12 max-w-[18ch]">
            What I work with.
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            {capabilities.map((c) => (
              <div key={c.group}>
                <h3 className="font-display text-xl font-black uppercase tracking-tight text-signal">
                  {c.group}
                </h3>
                <ul className="mt-4 space-y-2">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 border-b border-paper/12 pb-2 font-mono text-[0.78rem] uppercase tracking-[0.06em] text-paper/80"
                    >
                      <span aria-hidden="true" className="mt-[3px] text-signal">
                        ▸
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Now */}
      <section
        aria-labelledby="now-heading"
        className="grid-paper border-b-[2.5px] border-ink bg-paper py-20 sm:py-28"
      >
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="t-mono mb-3 text-ink/55">Now</p>
          <h2 id="now-heading" className="t-section mb-10">
            Currently.
          </h2>

          <dl className="grid gap-6 md:grid-cols-3">
            {[now.building, now.learning, now.exploring].map((n, i) => (
              <div
                key={n.label}
                className="brut bg-paper p-5 sm:p-6"
              >
                <dt className="chip chip-ink">{String(i + 1).padStart(2, "0")}</dt>
                <dd>
                  <p className="mt-4 font-display text-lg font-black uppercase tracking-tight">
                    {n.label}
                  </p>
                  <p className="mt-2 text-[0.94rem] leading-relaxed text-ink/72">{n.text}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
