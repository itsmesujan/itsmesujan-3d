import { projects, site } from "@/content/site";
import { renderSocialCard } from "@/lib/og";

export const alt = `${site.name} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The same card, declared for Twitter so the tag is always present. */
export default function TwitterImage() {
  return renderSocialCard({
    eyebrow: `${site.domain} / ${site.role}`,
    title: site.name,
    subtitle: site.tagline,
    footer: projects.map((p) => p.title).join("  /  "),
  });
}
