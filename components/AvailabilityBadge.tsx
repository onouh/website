import { profile } from "@/content/profile";

/**
 * Availability strip in the hero (PLAN.md item 4): one line that tells a
 * recruiter the seeking window before anything else on the page.
 *
 * The dot is a CSS-only live status metaphor (amber, like the site's accent):
 * it breathes via transform/opacity only — no repaint, no layout — and is
 * frozen by the global reduced-motion kill-switch, where it simply reads as
 * a solid dot. Static hero text: announced normally on load (no aria-live —
 * there's nothing live to announce). It gets its own line rather than
 * piggybacking on the kicker so it's the first content in the hero.
 */
export function AvailabilityBadge({ text }: { text?: string }) {
  const label = text ?? profile.availability;
  return (
    <p className="animate-fade-up mb-7 flex items-center gap-2.5 text-[0.82rem] tracking-[0.02em] text-[var(--text-mid)] [animation-delay:0.05s] opacity-0">
      <span
        aria-hidden
        className="availability-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--amber)]"
      />
      <span>{label}</span>
    </p>
  );
}
