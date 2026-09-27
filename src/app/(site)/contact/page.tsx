import type { Metadata } from "next";
import Contact from "@/sections/Contact";
import { PageSchema } from "@/components/JsonLd";
import { pages } from "@/content/site";

export const metadata: Metadata = {
  title: pages.contact.title,
  description: pages.contact.description,
  alternates: { canonical: pages.contact.path },
};

/** The action beat, with the validation rules that actually run on the server. */
export default function ContactPage() {
  const page = pages.contact;

  return (
    <>
      <PageSchema path={page.path} title={page.title} description={page.description} />
      <Contact headingLevel="h1" />
    </>
  );
}
