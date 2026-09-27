import { site, type Project } from "@/content/site";

/** The Person / WebSite nodes the root layout emits — referenced, never repeated. */
export const PERSON_ID = `${site.url}/#person`;
export const WEBSITE_ID = `${site.url}/#website`;

/**
 * Structured data builders.
 *
 * Every field here is a fact already present in the rendered page: the same
 * title, the same description, the same project data. Nothing is asserted for
 * search engines that a reader could not verify on the page itself.
 */

export function webPageSchema({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${site.url}${path}#webpage`,
    url: `${site.url}${path}`,
    name: title,
    description,
    inLanguage: "en",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": PERSON_ID },
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: `${site.url}${step.path}`,
    })),
  };
}

export function caseStudySchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${site.url}/work/${project.slug}#work`,
    url: `${site.url}/work/${project.slug}`,
    name: project.title,
    description: project.summary,
    abstract: project.idea,
    genre: project.kind,
    keywords: project.tech.join(", "),
    author: { "@id": PERSON_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}
