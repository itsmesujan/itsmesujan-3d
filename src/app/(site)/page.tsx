import Hero from "@/sections/Hero";
import Work from "@/sections/Work";

/**
 * The hub.
 *
 * Orientation, then proof: who this is, and what actually shipped. The depth —
 * the method, the case studies, the person, the contact form — lives on spoke
 * pages, which is why the hub carries no 3D scene beyond the hero's quiet
 * swarm. Nothing here is teased and then withheld: every claim the hub makes
 * links to the page that backs it.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Work />
    </>
  );
}
