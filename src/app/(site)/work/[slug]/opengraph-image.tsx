import { notFound } from "next/navigation";
import { projects, site } from "@/content/site";
import { renderSocialCard } from "@/lib/og";

export const alt = "Case study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * A card per case study, so a shared link carries the project's own name and
 * its measured numbers rather than the generic site card.
 */
export default async function CaseStudyImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  // The card route must not 500 for a slug that no longer exists.
  if (!project) notFound();

  return renderSocialCard({
    eyebrow: `${project.kind} / ${project.year}`,
    title: project.title,
    // A project's measured numbers are the most shareable thing about it, so
    // they lead when the project has them.
    subtitle: project.metrics?.length
      ? project.metrics.map((m) => `${m.value} ${m.label}`).join("   /   ")
      : project.summary,
    footer: `${project.stack}  /  ${site.domain}`,
  });
}
