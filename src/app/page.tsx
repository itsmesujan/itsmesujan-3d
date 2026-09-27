import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/sections/Hero";
import FleetSection from "@/sections/FleetSection";
import DagSection from "@/sections/DagSection";
import RouterSection from "@/sections/RouterSection";
import Work from "@/sections/Work";
import About from "@/sections/About";
import Contact from "@/sections/Contact";

/**
 * Page order is the argument:
 *   1. Orientation   — who this is
 *   2. Signature     — a fleet, aimed
 *   3. Evidence      — it heals itself (Agent-X)
 *   4. Mechanism     — local or cloud (DevPilot)
 *   5. Proof         — the shipped work, in numbers
 *   6. Credibility   — who is behind it
 *   7. Action        — get in touch
 *
 * The three 3D beats are separated by 2D so the page breathes, and Work sits
 * after them so the 3D is never asked to do the job of evidence.
 */
export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border-[2.5px] focus:border-ink focus:bg-paper focus:px-4 focus:py-2.5 focus:font-mono focus:text-[0.75rem] focus:font-bold focus:uppercase"
      >
        Skip to content
      </a>

      <Header />

      <main id="main">
        <Hero />
        <FleetSection />
        <DagSection />
        <RouterSection />
        <Work />
        <About />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
