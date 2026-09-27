"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

export type FieldErrors = Record<string, string>;

export type ContactState = {
  status: "idle" | "ok" | "invalid" | "error" | "unconfigured";
  errors: FieldErrors;
};

/**
 * Contact form.
 *
 * Server action is the source of truth: validation runs there, and this
 * component only renders whatever it says. There is no client-side-only
 * success path — a message is never reported as sent unless the server
 * confirms it.
 */
export default function ContactForm({
  action,
}: {
  action: (state: ContactState, formData: FormData) => Promise<ContactState>;
}) {
  const [state, formAction] = useActionState(action, {
    status: "idle",
    errors: {},
  });

  // Move focus to the first error so keyboard and screen-reader users are
  // told what happened without hunting for it.
  const summaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "invalid" && summaryRef.current) {
      summaryRef.current.focus();
    }
  }, [state.status]);

  return (
    <form action={formAction} noValidate className="brut bg-paper p-5 sm:p-6">
      {state.status === "invalid" && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="mb-5 border-[2.5px] border-ink bg-signal px-4 py-3 text-paper"
        >
          <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em]">
            Please fix the following
          </p>
          <ul className="mt-2 space-y-1">
            {Object.entries(state.errors).map(([field, message]) => (
              <li key={field} className="text-[0.88rem]">
                <a href={`#${field}`} className="underline">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {state.status === "unconfigured" && (
        <div
          role="status"
          className="mb-5 border-[2.5px] border-ink bg-paper-dim px-4 py-3"
        >
          <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em]">
            Form not connected yet
          </p>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-ink/75">
            Your message passed validation, but no mail provider is wired up in
            this build yet. Email me directly and I&apos;ll get back to you.
          </p>
        </div>
      )}

      {state.status === "ok" && (
        <div role="status" className="mb-5 border-[2.5px] border-ink bg-ink px-4 py-3 text-paper">
          <p className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em]">
            Message sent
          </p>
          <p className="mt-2 text-[0.88rem] text-paper/80">
            Thanks — I&apos;ll reply to the address you gave me.
          </p>
        </div>
      )}

      {state.status === "error" && (
        <div role="alert" className="mb-5 border-[2.5px] border-ink bg-signal px-4 py-3 text-paper">
          <p className="text-[0.88rem]">
            Something went wrong sending that. Please try again, or email me directly.
          </p>
        </div>
      )}

      <div className="space-y-5">
        <Field label="Name" name="name" type="text" required autoComplete="name" errors={state.errors} />
        <Field label="Email" name="email" type="email" required autoComplete="email" errors={state.errors} />
        <Field label="Project" name="subject" type="text" required autoComplete="off" errors={state.errors} />

        <div>
          <label
            htmlFor="message"
            className="mb-2 block font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/60"
          >
            What are you building? <span className="text-signal">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            minLength={10}
            maxLength={5000}
            aria-invalid={state.errors.message ? true : undefined}
            aria-describedby={state.errors.message ? "message-error" : undefined}
            className={`w-full border-[2.5px] bg-paper px-4 py-3 font-body text-[0.95rem] text-ink placeholder:text-ink/35 ${
              state.errors.message ? "border-signal-deep" : "border-ink"
            }`}
            placeholder="The problem, the constraint, and why it matters."
          />
          {state.errors.message && (
            <p id="message-error" className="mt-1.5 font-mono text-[0.7rem] text-signal-deep">
              {state.errors.message}
            </p>
          )}
        </div>

        {/* Honeypot — off-screen for people, irresistible to bots. */}
        <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="company">Company (leave empty)</label>
          <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <SubmitButton />

      <p className="mt-4 font-mono text-[0.68rem] leading-relaxed tracking-[0.04em] text-ink/50">
        No mailing list, no tracking pixels, no newsletter.
      </p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

function Field({
  label,
  name,
  type,
  required,
  autoComplete,
  errors,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  errors: FieldErrors;
}) {
  const error = errors[name];
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block font-mono text-[0.7rem] font-bold uppercase tracking-[0.12em] text-ink/60"
      >
        {label} {required && <span className="text-signal">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full border-[2.5px] bg-paper px-4 py-3 font-body text-[0.95rem] text-ink placeholder:text-ink/35 ${
          error ? "border-signal-deep" : "border-ink"
        }`}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 font-mono text-[0.7rem] text-signal-deep">
          {error}
        </p>
      )}
    </div>
  );
}
