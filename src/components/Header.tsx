"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { nav, site } from "@/content/site";
import { useNavHref } from "@/lib/useNavHref";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  // Hash targets are native in-page anchors here, and real navigations home
  // from any other route. One source, resolved for wherever we are.
  const resolveHref = useNavHref();

  // Lock body scroll while the mobile sheet owns the viewport.
  useEffect(() => {
    document.body.dataset.menuOpen = open ? "true" : "false";
    return () => {
      document.body.dataset.menuOpen = "false";
    };
  }, [open]);

  // The header gains a hard border once the page has scrolled off the hero.
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the sheet — expected of any modal navigation.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        solid ? "border-b-[2.5px] border-ink bg-paper/95 backdrop-blur-sm" : "border-b-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link
          href={resolveHref("#top")}
          className="flex items-center gap-2.5 font-mono text-[0.8rem] font-bold uppercase tracking-[0.1em] no-underline"
        >
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 bg-signal"
          />
          {site.handle}
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={resolveHref(item.href)}
                  className="inline-flex items-center px-3 py-2.5 font-mono text-[0.72rem] font-semibold uppercase tracking-[0.1em] no-underline transition-colors hover:bg-ink hover:text-paper"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="ml-2">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{ minHeight: 40 }}
              >
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile toggle — 44px+ target, real button, real aria state */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="brut-sm inline-flex h-11 w-11 items-center justify-center md:hidden"
          style={{ boxShadow: "3px 3px 0 0 var(--color-ink)" }}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <span aria-hidden="true" className="flex flex-col gap-[5px]">
            <span
              className="block h-[2.5px] w-5 bg-ink transition-transform duration-200"
              style={{ transform: open ? "translateY(7.5px) rotate(45deg)" : "none" }}
            />
            <span
              className="block h-[2.5px] w-5 bg-ink transition-opacity duration-200"
              style={{ opacity: open ? 0 : 1 }}
            />
            <span
              className="block h-[2.5px] w-5 bg-ink transition-transform duration-200"
              style={{ transform: open ? "translateY(-7.5px) rotate(-45deg)" : "none" }}
            />
          </span>
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div
          id="mobile-nav"
          className="border-t-[2.5px] border-ink bg-paper md:hidden"
        >
          <nav aria-label="Primary mobile" className="px-5 py-3">
            <ul>
              {nav.map((item) => (
                <li key={item.href} className="border-b border-ink/15 last:border-b-0">
                  <Link
                    href={resolveHref(item.href)}
                    onClick={() => setOpen(false)}
                    className="block py-4 font-display text-2xl font-black uppercase tracking-tight no-underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-4 w-full"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
