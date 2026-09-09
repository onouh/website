import { track } from "@vercel/analytics";

/**
 * Funnel events (PLAN.md item 6) — the recruiter-conversion actions worth
 * counting. Keep this union closed: every event must answer "what did a
 * recruiter do next" or get cut.
 */
export type FunnelEvent =
  | "contact_submit"
  | "pdf_download"
  | "email_click"
  | "social_click";

export type FunnelProperties = Record<string, string>;

/** Wrap `track` so a broken/s blocked analytics call can never break UX. */
export function trackEvent(event: FunnelEvent, properties?: FunnelProperties) {
  try {
    track(event, properties);
  } catch {
    // Analytics is additive telemetry — silence on failure is correct.
  }
}
