import type { Metadata } from "next";
import FleetSection from "@/sections/FleetSection";
import { PageSchema } from "@/components/JsonLd";
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
  const page = pages.method;

  return (
    <>
      <PageSchema path={page.path} title={page.title} description={page.description} />
      <FleetSection headingLevel="h1" />
    </>
  );
}
