import Footer from "@/components/Footer";
import Header from "@/components/Header";

/**
 * The site chrome, shared by every page in this group.
 *
 * The skip link and the `#main` landmark live here rather than in each page: a
 * skip link that exists on some routes and not others is worse than none,
 * because the tab order stops being predictable.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border-[2.5px] focus:border-ink focus:bg-paper focus:px-4 focus:py-2.5 focus:font-mono focus:text-[0.75rem] focus:font-bold focus:uppercase"
      >
        Skip to content
      </a>

      <Header />

      <main id="main">{children}</main>

      <Footer />
    </>
  );
}
