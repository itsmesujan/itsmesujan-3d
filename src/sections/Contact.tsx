import ContactForm, { type ContactState } from "@/components/ContactForm";
import { contact, site } from "@/content/site";

/**
 * Closing action beat.
 *
 * Validation is enforced here, on the server. The action never reports a
 * message as sent unless delivery actually succeeded — there is no fake
 * success state, and no client-side shortcut past the server.
 */

async function submit(_prev: ContactState, formData: FormData): Promise<ContactState> {
  "use server";

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const trap = String(formData.get("company") ?? "");

  // Honeypot: accept silently so bots learn nothing, but send nothing.
  if (trap) return { status: "ok", errors: {} };

  const errors: Record<string, string> = {};

  if (name.length < 2) errors.name = "Please enter your name.";
  else if (name.length > 120) errors.name = "Name must be under 120 characters.";

  // Permissive but structural — catches typos without rejecting valid addresses.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.email = "Please enter a valid email address.";
  } else if (email.length > 200) {
    errors.email = "Email address is too long.";
  }

  if (subject.length < 2) errors.subject = "Give the project a short name.";
  else if (subject.length > 160) errors.subject = "Project name is too long.";

  if (message.length < 10) errors.message = "Tell me a little more — at least 10 characters.";
  else if (message.length > 5000) errors.message = "Message must be under 5000 characters.";

  if (Object.keys(errors).length > 0) {
    return { status: "invalid", errors };
  }

  /*
   * Delivery.
   *
   * No mail provider is configured in this build, so we say exactly that
   * rather than pretending a message was sent.
   *
   * To enable real delivery, replace this return with a provider call and
   * only return { status: "ok" } once it has actually succeeded:
   *
   *   await resend.emails.send({ from, to, replyTo: email, subject, text: message });
   *   return { status: "ok", errors: {} };
   */
  return { status: "unconfigured", errors: {} };
}

type Props = {
  /** "h1" when this section is the page's primary content. */
  headingLevel?: "h1" | "h2";
};

export default function Contact({ headingLevel = "h2" }: Props) {
  const Heading = headingLevel;

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className={`border-b-[2.5px] border-ink bg-paper pb-20 sm:pb-28 ${
        headingLevel === "h1" ? "page-top" : "pt-20 sm:pt-28"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,32rem)]">
          <div>
            <p className="t-mono mb-3 text-ink/55">Contact</p>
            <Heading id="contact-heading" className="t-section max-w-[14ch]">
              {contact.heading}
            </Heading>
            <p className="t-body-lg t-measure mt-6 text-ink/75">{contact.body}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.github}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Message on GitHub <span aria-hidden="true">↗</span>
              </a>
              <a href={`mailto:${site.email}`} className="btn">
                Email <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <ContactForm action={submit} />
        </div>
      </div>
    </section>
  );
}
