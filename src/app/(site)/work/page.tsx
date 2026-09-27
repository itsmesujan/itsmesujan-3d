import type { Metadata } from "next";
import Work from "@/sections/Work";
import { PageSchema } from "@/components/JsonLd";
import { pages } from "@/content/site";

export const metadata: Metadata = {
  title: pages.work.title,
  description: pages.work.description,
  alternates: { canonical: pages.work.path },
};

/**
 * The work index — the canonical list of case studies.
 *
 * It renders the same cards the hub previews, in the detailed variant: the
 * stack and the tech list for each project come from `site.ts`, so the index
 * carries more than the preview rather than the same thing twice.
 */
export default function WorkPage() {
  const page = pages.work;

  return (
    <>
      <PageSchema path={page.path} title={page.title} description={page.description} />
      <Work headingLevel="h1" detailed />
    </>
  );
}
