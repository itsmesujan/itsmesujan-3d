import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

/**
 * The shared social-card renderer.
 *
 * Every generated image on this site comes from here, so the favicon, the
 * Open Graph card and a case study's own card cannot drift into three
 * different-looking brands. Text is set in the renderer's built-in font rather
 * than the site's display face on purpose: loading a webfont here would add a
 * network fetch to every build for a card most visitors never see.
 */
export function renderSocialCard({
  eyebrow,
  title,
  subtitle,
  footer,
  titleSize = 76,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  footer: string;
  titleSize?: number;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: brand.paper,
          border: `18px solid ${brand.ink}`,
          padding: 56,
        }}
      >
        {/* Eyebrow: the mark from the header, plus where this came from. */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 22, height: 22, background: brand.signal }} />
          <div
            style={{
              marginLeft: 16,
              fontSize: 24,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: brand.ink,
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              textTransform: "uppercase",
              color: brand.ink,
            }}
          >
            {title}
          </div>
          <div
            style={{
              marginTop: 20,
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(10, 10, 10, 0.72)",
              maxWidth: 980,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* Footer: a signal-orange rule, then the one line of metadata. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ width: "100%", height: 6, background: brand.signal }} />
          <div
            style={{
              marginTop: 20,
              fontSize: 22,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: "rgba(10, 10, 10, 0.6)",
            }}
          >
            {footer}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
