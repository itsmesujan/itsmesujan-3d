import type { Metadata } from "next";
import FleetSection from "@/sections/FleetSection";
import { pages } from "@/content/site";

export const metadata: Metadata = {
  title: pages.method.title,
  description: pages.method.description,
  alternates: { canonical: pages.method.path },
};

/**
 * The method page — the six-stage loop, and the swarm that resolves into it.
 * This is where the fleet scene belongs: it is the one page whose subject *is*
 * the loop.
 */
export default function MethodPage() {
  return <FleetSection headingLevel="h1" />;
}
