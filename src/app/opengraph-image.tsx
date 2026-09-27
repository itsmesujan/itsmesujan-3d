import { projects, site } from "@/content/site";
import { renderSocialCard } from "@/lib/og";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The site-wide card. Every claim on it is a string from `site.ts`. */
export default function OpengraphImage() {
  return renderSocialCard({
    eyebrow: `${site.domain} / ${site.role}`,
    title: site.name,
    subtitle: site.tagline,
    footer: projects.map((p) => p.title).join("  /  "),
  });
}
