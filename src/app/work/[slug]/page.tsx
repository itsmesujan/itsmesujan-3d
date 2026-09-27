import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { projects, site } from "@/content/site";

/** Pre-render every case study at build time. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Case study" };

  return {
    title: `${project.title} — case study`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      type: "article",
      title: `${project.title} — case study`,
      description: project.summary,
      url: `${site.url}/work/${project.slug}`,
    },
  };
}

export default async function CaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <>
      <Header />
      <main id="main" className="pt-24">
        <article>
          {/* Masthead */}
          <header className="grid-paper border-b-[2.5px] border-ink bg-paper pb-14 pt-12">
            <div className="mx-auto max-w-4xl px-5 sm:px-8">
              <Link
                href="/#work"
                className="t-mono inline-flex items-center gap-2 text-ink/60 no-underline transition-colors hover:text-signal"
              >
                <span aria-hidden="true">←</span> Back to selected work
              </Link>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <span className="chip chip-signal">{project.kind}</span>
                <span className="chip border-ink/30 text-ink/70">{project.year}</span>
                <span className="chip border-ink/30 text-ink/70">{project.stack}</span>
              </div>

              <h1 className="t-display mt-6">{project.title}</h1>
              <p className="t-body-lg t-measure mt-6 text-ink/78">{project.summary}</p>
            </div>
          </header>

          {/* Body */}
          <div className="bg-paper py-16 sm:py-20">
            <div className="mx-auto max-w-4xl px-5 sm:px-8">
              <div className="space-y-14">
                <Chapter title="The problem">
                  <p className="t-body-lg text-ink/82">{project.problem}</p>
                </Chapter>

                <Chapter title="The idea">
                  <p className="t-body-lg text-ink/82">{project.idea}</p>
                </Chapter>

                <Chapter title="Challenges">
                  <ul className="space-y-3.5">
                    {project.challenges.map((c) => (
                      <li key={c} className="flex gap-3.5">
                        <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 bg-signal" />
                        <span className="t-body-lg text-ink/80">{c}</span>
                      </li>
                    ))}
                  </ul>
                </Chapter>

                <Chapter title="Iteration">
                  <p className="t-body-lg text-ink/80">{project.iteration}</p>
                  {/* The 5-step loop, always shown — it built every project. */}
                  <ol className="mt-6 flex flex-wrap gap-1.5" aria-label="How agents built it">
                    {["spec", "agents", "review", "iterate", "ship"].map((s, i) => (
                      <li key={s} className="flex items-center gap-1.5">
                        <span className="chip border-ink/25 text-ink/70">
                          <span className="text-signal">{String(i + 1).padStart(2, "0")}</span> {s}
                        </span>
                        {i < 4 && (
                          <span aria-hidden="true" className="text-ink/30">
                            →
                          </span>
                        )}
                      </li>
                    ))}
                  </ol>
                </Chapter>

                <Chapter title="Result — what shipped">
                  <div className="brut-signal bg-ink p-6 text-paper sm:p-8">
                    <p className="t-body-lg">{project.result}</p>
                  </div>
                </Chapter>

                <Chapter title="Tech">
                  <ul className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <li key={t} className="chip border-ink/30 text-ink/75">
                        {t}
                      </li>
                    ))}
                  </ul>
                </Chapter>
              </div>

              {/* Next projects */}
              <nav aria-label="Other case studies" className="mt-20 border-t-[2.5px] border-ink pt-10">
                <h2 className="t-mono mb-5 text-ink/55">Other case studies</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {others.map((o) => (
                    <li key={o.slug}>
                      <Link
                        href={`/work/${o.slug}`}
                        className="brut block bg-paper p-5 no-underline transition-transform hover:-translate-y-1"
                      >
                        <span className="chip border-ink/30 text-ink/60">{o.kind}</span>
                        <span className="t-card mt-3 block">{o.title}</span>
                        <span className="mt-2 block text-[0.9rem] leading-relaxed text-ink/70">
                          {o.summary}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Chapter({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 flex items-center gap-3">
        <span aria-hidden="true" className="h-3 w-3 bg-signal" />
        <span className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink/60">
          {title}
        </span>
      </h2>
      {children}
    </section>
  );
}
