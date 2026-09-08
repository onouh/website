"use client";

import { useActionState, useState } from "react";
import { submitContact, type ContactState } from "@/app/actions/contact";

const initial: ContactState | null = null;

/** Client-side mirror of the server's validation rules, so feedback is
 * instant on blur and the server stays the source of truth on submit. */
function validate(name: string, email: string, message: string) {
  const errors: { name?: string; email?: string; message?: string } = {};
  if (!name.trim()) errors.name = "Please enter your name.";
  else if (name.trim().length > 120) errors.name = "Name is too long (max 120).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.email = "Please enter a valid email.";
  else if (email.trim().length > 200) errors.email = "Email is too long (max 200).";
  if (message.trim().length < 10)
    errors.message = "Please write a message of at least 10 characters.";
  else if (message.length > 5000) errors.message = "Message is too long (max 5000).";
  return errors;
}

type FieldErrors = ReturnType<typeof validate>;

const FIELD_BASE =
  "w-full rounded-[var(--radius)] border bg-[var(--bg-3)] px-3 py-2 text-[var(--text)] transition-[border-color] duration-150 focus-visible:outline-2 focus-visible:outline-[var(--amber)]";
const FIELD_OK = "border-[var(--border-2)]";
const FIELD_BAD = "border-red-400/70";

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [touched, setTouched] = useState<Record<"name" | "email" | "message", boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [attempted, setAttempted] = useState(false);

  const errors = validate(values.name, values.email, values.message);
  const show = (field: keyof FieldErrors) =>
    (touched[field] || attempted) && errors[field] ? errors[field] : undefined;
  const hasClientErrors = Object.keys(errors).length > 0;

  const set = (field: keyof typeof values) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
  };
  const blur = (field: keyof typeof values) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const fieldCls = (field: keyof FieldErrors) =>
    `${FIELD_BASE} ${show(field) ? FIELD_BAD : FIELD_OK}`;

  return (
    <form
      action={action}
      className="flex max-w-xl flex-col gap-4"
      noValidate
      onSubmit={(event) => {
        setAttempted(true);
        // Let the server action run — it re-validates — but if the client
        // already knows the form is invalid, block the round-trip.
        if (hasClientErrors) event.preventDefault();
      }}
    >
      <label className="flex flex-col gap-1.5 text-sm text-[var(--text-mid)]">
        Name
        <input
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(e) => set("name")(e.target.value)}
          onBlur={blur("name")}
          aria-invalid={show("name") ? true : undefined}
          aria-describedby={show("name") ? "contact-name-error" : undefined}
          className={fieldCls("name")}
        />
        {show("name") ? (
          <span id="contact-name-error" className="text-xs text-[var(--red)]">
            {errors.name}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[var(--text-mid)]">
        Email
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set("email")(e.target.value)}
          onBlur={blur("email")}
          aria-invalid={show("email") ? true : undefined}
          aria-describedby={show("email") ? "contact-email-error" : undefined}
          className={fieldCls("email")}
        />
        {show("email") ? (
          <span id="contact-email-error" className="text-xs text-[var(--red)]">
            {errors.email}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[var(--text-mid)]">
        Message
        <textarea
          name="message"
          rows={6}
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          onBlur={blur("message")}
          aria-invalid={show("message") ? true : undefined}
          aria-describedby={show("message") ? "contact-message-error" : undefined}
          className={fieldCls("message")}
        />
        {show("message") ? (
          <span id="contact-message-error" className="text-xs text-[var(--red)]">
            {errors.message}
          </span>
        ) : null}
      </label>

      <button
        type="submit"
        className="btn btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending}
      >
        {pending ? (
          <>
            <span
              aria-hidden
              className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
            Sending…
          </>
        ) : (
          "Send message"
        )}
      </button>

      {/* One polite live region carries both outcomes; role="status" keeps
          SRs announcing without stealing focus. role="alert" would be
          needlessly interruptive for a form the user just drove. */}
      <div aria-live="polite" role="status">
        {state?.ok ? (
          <p className="flex flex-col gap-1 text-sm text-[var(--amber)]">
            <span>
              {state.sentVia === "resend"
                ? "Message sent. I'll get back to you."
                : "Saved. If you prefer, you can also email me directly."}
            </span>
            {state.mailto ? (
              <a className="w-fit underline" href={state.mailto}>
                Open mail app
              </a>
            ) : null}
          </p>
        ) : null}
        {state && !state.ok ? (
          <p className="flex flex-col gap-1 text-sm text-[var(--red)]">
            <span>{state.error}</span>
            {state.mailto ? (
              <a className="w-fit underline" href={state.mailto}>
                Email instead
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  );
}
