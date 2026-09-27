import type { Metadata } from "next";
import Contact from "@/sections/Contact";
import { pages } from "@/content/site";

export const metadata: Metadata = {
  title: pages.contact.title,
  description: pages.contact.description,
  alternates: { canonical: pages.contact.path },
};

/** The action beat, with the validation rules that actually run on the server. */
export default function ContactPage() {
  return <Contact headingLevel="h1" />;
}
