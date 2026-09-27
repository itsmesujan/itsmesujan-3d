import type { Metadata } from "next";
import About from "@/sections/About";
import { PageSchema } from "@/components/JsonLd";
import { pages } from "@/content/site";

export const metadata: Metadata = {
  title: pages.about.title,
  description: pages.about.description,
  alternates: { canonical: pages.about.path },
};

/** About, capabilities, and what is in progress — one subject, one page. */
export default function AboutPage() {
  const page = pages.about;

  return (
    <>
      <PageSchema path={page.path} title={page.title} description={page.description} />
      <About headingLevel="h1" />
    </>
  );
}
