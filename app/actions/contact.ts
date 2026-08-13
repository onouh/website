"use server";

import { mkdir, appendFile } from "node:fs/promises";
import { join } from "node:path";
import { profile } from "@/content/profile";

export type ContactState = {
  ok: boolean;
  error?: string;
  mailto?: string;
  sentVia?: "resend" | "stored" | "mailto";
};

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

  try {
    const dir = join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      join(dir, "contact.jsonl"),
      `${JSON.stringify({ name, email, message, at: new Date().toISOString() })}\n`,
    );
    return { ok: true, sentVia: "stored", mailto };
  } catch {
    return { ok: true, sentVia: "mailto", mailto };
  }
}
