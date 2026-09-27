"use client";

import Link from "next/link";
import { nav, site } from "@/content/site";
import { useNavHref } from "@/lib/useNavHref";

const YEAR = new Date().getFullYear();

export default function Footer() {
  // Same resolution as the header: hash targets work from every route.
  const resolveHref = useNavHref();

  return (
    <footer className="no-print border-t-[2.5px] border-ink bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-black uppercase leading-none tracking-tight">
              {site.name}
            </p>
            <p className="mt-3 max-w-sm font-mono text-[0.78rem] uppercase leading-relaxed tracking-[0.06em] text-paper/70">
              {site.role} · Based in {site.location} · Building globally
            </p>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border-2 border-paper px-3.5 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-paper no-underline transition-colors hover:bg-paper hover:text-ink"
            >
              @{site.handle} <span aria-hidden="true">↗</span>
            </a>
          </div>

          <nav aria-label="Footer">
            <h2 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-paper/50">
              Navigate
            </h2>
            <ul className="mt-4 space-y-2.5">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={resolveHref(item.href)}
                    className="inline-flex items-center py-2 font-mono text-[0.8rem] uppercase tracking-[0.06em] text-paper/85 no-underline transition-colors hover:text-signal"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-paper/50">
              This page
            </h2>
            <p className="mt-4 font-mono text-[0.78rem] leading-relaxed text-paper/70">
              Neo-brutalist, with a real-time 3D layer that degrades to a static
              composition on reduced motion or missing WebGL.
            </p>
            <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-paper/45">
              © {YEAR} {site.name}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
