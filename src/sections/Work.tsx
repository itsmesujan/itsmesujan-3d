"use client";

import Link from "next/link";
import { pages, projects } from "@/content/site";
import { useReveal } from "@/lib/useClock";

type Props = {
  /** "h1" when this section is the page's primary content. */
  headingLevel?: "h1" | "h2";
  /** The index adds each project's stack and tech; the hub preview doesn't. */
  detailed?: boolean;
};

/** Selected work. Cards link to real case studies, and state the stack. */
export default function Work({ headingLevel = "h2", detailed = false }: Props) {
  const ref = useReveal<HTMLElement>(0.05);
  const Heading = headingLevel;

  return (
    <section
      ref={ref}
      id="work"
      aria-labelledby="work-heading"
      className={`border-b-[2.5px] border-ink bg-paper pb-20 sm:pb-28 ${
        headingLevel === "h1" ? "page-top" : "pt-20 sm:pt-28"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <header className="fade-up mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-mono mb-3 text-ink/55">{pages.work.title}</p>
            <Heading id="work-heading" className="t-section max-w-[16ch]">
              Proof over claims.
            </Heading>
          </div>
          <p className="t-measure max-w-xs text-[0.92rem] text-ink/65">
            {pages.work.description}
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <li key={p.slug} className="fade-up" style={{ transitionDelay: `${i * 90}ms` }}>
              <article className="brut group flex h-full flex-col bg-paper p-5 transition-transform duration-200 hover:-translate-y-1 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={
                      p.accent === "signal"
                        ? "chip chip-signal"
                        : p.accent === "verify"
                          ? "chip border-ink bg-ink text-paper"
                          : "chip border-ink/30 text-ink/70"
                    }
                  >
                    {p.kind}
                  </span>
                  <span className="chip border-ink/25 text-ink/55">{p.year}</span>
                </div>

                <h3 className="t-card mt-5">{p.title}</h3>

                <p className="mt-3 flex-1 text-[0.94rem] leading-relaxed text-ink/72">
                  {p.summary}
                </p>

                <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink/50">
                  {p.stack}
                </p>

                {detailed && (
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {p.tech.map((t) => (
                      <li key={t} className="chip border-ink/25 text-ink/65">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/work/${p.slug}`}
                  className="mt-5 inline-flex items-center gap-2 border-2 border-ink px-4 py-3 font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em] no-underline transition-colors hover:bg-ink hover:text-paper"
                >
                  Case study <span aria-hidden="true">→</span>
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
