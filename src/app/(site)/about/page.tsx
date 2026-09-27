import type { Metadata } from "next";
import About from "@/sections/About";
import { pages } from "@/content/site";

export const metadata: Metadata = {
  title: pages.about.title,
  description: pages.about.description,
  alternates: { canonical: pages.about.path },
};

/** About, capabilities, and what is in progress — one subject, one page. */
export default function AboutPage() {
  return <About headingLevel="h1" />;
}
