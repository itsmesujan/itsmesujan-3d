import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

/**
 * Renders one JSON-LD block.
 *
 * Schema is built from our own static content, never from user input, so the
 * `dangerouslySetInnerHTML` here is a serialisation detail rather than a
 * trust boundary.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * The schema every spoke page emits: the page itself, plus its place in the
 * site. Both are built from the same strings the page renders.
 */
export function PageSchema({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}) {
  return (
    <>
      <JsonLd data={webPageSchema({ path, title, description })} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: title, path },
        ])}
      />
    </>
  );
}
