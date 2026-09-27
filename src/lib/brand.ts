/**
 * The brand palette, for renderers that cannot read CSS.
 *
 * `globals.css` `@theme` is the source of truth for the site itself; the
 * favicon, the Apple touch icon and the Open Graph images are generated as
 * images, where CSS variables do not exist. Keep these two in step.
 */
export const brand = {
  ink: "#0a0a0a",
  paper: "#f4f1ea",
  signal: "#ff4d1c",
  verify: "#00e07a",
} as const;
