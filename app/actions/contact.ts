"use server";

import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/content/profile";

export type ContactState = {
  ok: boolean;
  error?: string;
  mailto?: string;
  sentVia?: "resend" | "stored" | "skip";
};

// A human reading the prompt and typing three fields takes well over this;
// bots that autofill submit in a fraction of it. Generous floor to avoid
// false positives on slow hands.
const MIN_FILL_MS = 3000;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function mailtoHref(name: string, email: string, message: string) {
  const subject = `Site contact from ${name}`;
  const body = `${message}\n\n— ${name} <${email}>`;
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function submitContact(
  _prev: ContactState | null,
  formData: FormData,
): Promise<ContactState> {
  // --- Spam guard first, so we never spend work on an automated submission.
  // A filled honeypot (bots fill every named field) or an implausibly fast
  // submit is a bot. Acknowledge it without doing anything, so a bot learns
  // nothing and incurs no delivery cost.
  const honeypot = String(formData.get("website") ?? "").trim();
  const mountedAt = Number(formData.get("ts"));
  const tooFast =
    Number.isFinite(mountedAt) && mountedAt > 0 && Date.now() - mountedAt < MIN_FILL_MS;
  if (honeypot || tooFast) {
    return { ok: true, sentVia: "skip" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || name.length > 120) {
    return { ok: false, error: "Please enter your name." };
  }
  if (!isEmail(email) || email.length > 200) {
    return { ok: false, error: "Please enter a valid email." };
  }
  if (message.length < 10 || message.length > 5000) {
    return { ok: false, error: "Please write a message of at least 10 characters." };
  }

  const mailto = mailtoHref(name, email, message);
  const subject = `Site contact from ${name}`;
  const text = `${message}\n\n— ${name} <${email}>`;

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(apiKey);
      const to = process.env.CONTACT_TO_EMAIL ?? profile.email;
      const from =
        process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";
      const { error } = await resend.emails.send({
        from,
        to,
        replyTo: email,
        subject,
        text,
      });
      if (error) {
        return {
          ok: false,
          error: "Could not send just now. Use the email fallback.",
          mailto,
        };
      }
      return { ok: true, sentVia: "resend" };
    } catch {
      return {
        ok: false,
        error: "Could not send just now. Use the email fallback.",
        mailto,
      };
    }
  }

  // No Resend key. A local file store is a real delivery only where the
  // filesystem is actually writable (local dev). On serverless the cwd is
  // read-only, so the write throws — and instead of pretending success we
  // surface the mailto path as the truthful outcome.
  try {
    const dir = join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      join(dir, "contact.jsonl"),
      `${JSON.stringify({ name, email, message, at: new Date().toISOString() })}\n`,
    );
    return { ok: true, sentVia: "stored", mailto };
  } catch {
    return {
      ok: false,
      error:
        "Direct email isn't enabled on this instance. Email me with the link below.",
      mailto,
    };
  }
}
