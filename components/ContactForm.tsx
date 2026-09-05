"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/app/actions/contact";

const initial: ContactState | null = null;

export function ContactForm() {
  const [state, action, pending] = useActionState(submitContact, initial);

  return (
    <form action={action} className="flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm text-[var(--text-mid)]">
        Name
        <input
          required
          name="name"
          autoComplete="name"
          className="rounded-[var(--radius)] border border-[var(--border-2)] bg-[var(--bg-3)] px-3 py-2 text-[var(--text)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[var(--text-mid)]">
        Email
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="rounded-[var(--radius)] border border-[var(--border-2)] bg-[var(--bg-3)] px-3 py-2 text-[var(--text)]"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-[var(--text-mid)]">
        Message
        <textarea
          required
          name="message"
          rows={6}
          minLength={10}
          className="rounded-[var(--radius)] border border-[var(--border-2)] bg-[var(--bg-3)] px-3 py-2 text-[var(--text)]"
        />
      </label>
      <button
        type="submit"
        className="btn btn-primary w-fit disabled:opacity-60"
        disabled={pending}
      >
        {pending ? "Sending…" : "Send message"}
      </button>
      {state?.ok ? (
        <p className="text-sm text-[var(--amber)]" role="status">
          {state.sentVia === "resend"
            ? "Message sent. I’ll get back to you."
            : "Saved. If you prefer, you can also email me directly."}
          {state.mailto ? (
            <>
              {" "}
              <a className="underline" href={state.mailto}>
                Open mail app
              </a>
            </>
          ) : null}
        </p>
      ) : null}
      {state && !state.ok ? (
        <p className="text-sm text-red-400" role="alert">
          {state.error}{" "}
          {state.mailto ? (
            <a className="underline" href={state.mailto}>
              Email instead
            </a>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
