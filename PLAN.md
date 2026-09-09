# Website Improvement Plan — v2 (2026-09)

Status legend: [ ] todo · [~] in progress · [x] done
Effort: (0.5) half day · (1) one day · (2) two days — focused single-sitting work
`(needs-you)` marks items blocked on a decision or asset only Omar can supply.

**North star:** a recruiter with 60 seconds and zero context can — in under three
clicks, on any device, in either theme — understand who Omar is, see verifiable
proof, and make contact. Every item must serve that or get cut.

**Sequence:** attack order 1 → 2 → 3 → 4 → 6 → 5 → 7+10 together → 8+9 together
→ 11 → 12 → 14 → 15 → 16. Tier 0 first because the domain unblocks 1, 3 and the
Resend sender. 7+10 share the content-rewriting mindset; 8+9 both land on /about.
Item 13 stays a stretch goal — cut it first when a week goes sideways.

---

## Tier 0 — foundations (do first, ~1.5 days total)

### 1. Custom domain + production env audit (1)
- [ ] Buy/connect the domain `(needs-you: deferred 2026-09 — conscious deferral, not forgotten)`, add to Vercel, fix apex/www redirect.
- [ ] Set `NEXT_PUBLIC_SITE_URL` — sitemap, robots, OG and future canonicals all flow from `getSiteUrl()`.
- [ ] Verify prod secrets: `RESEND_API_KEY` and `CONTACT_TO_EMAIL` actually set on the Vercel project.
- [ ] Send one real contact submission end-to-end and confirm the email lands.
- [ ] Update anywhere the vercel.app URL is printed (resume PDF, README).
- **Accepts:** site + OG cards resolve on the new domain (verified in LinkedIn Post Inspector — that's where the link gets pasted); a real submission arrives in the inbox.

### 2. Contact delivery truthfulness + spam guard (0.5)
- [x] Kill the fake-success path: on Vercel, `process.cwd()` is read-only, so the
      `.data/contact.jsonl` fallback in `app/actions/contact.ts` throws and the
      catch returns `ok: true` — with no `RESEND_API_KEY` the form reports
      success while silently dropping the message. Target behavior matrix:
      key set → Resend, success/error surfaced honestly; no key → return the
      mailto link as the primary result and have the UI present "email me
directly" as the outcome — never `ok: true` without a real delivery. The
      local `.data` write becomes a dev-only convenience.
- [x] Honeypot field + minimum fill-time check in the server action (no new infra).
- [ ] Verify the Resend sender on the new domain (removes the `onboarding@resend.dev` from-line).
- **Accepts:** every submit path ends in a truthful state; junk submissions bounce free.

---

## Tier 1 — recruiter-conversion quick wins (half day each)

### 3. Structured data + canonical URLs (0.5)
- [x] JSON-LD `ProfilePage` + `Person` graph on home (`lib/jsonld.ts`, `<script type="application/ld+json">`):
      name, jobTitle, alumniOf, `sameAs` → LinkedIn/GitHub, `knowsAbout`, availability as `PropertyValue`.
- [x] `routeMetadata()` helper: `alternates.canonical` + `og:url` on every route (case studies per slug),
      `og:site_name` in the shared defaults; `twitter:image` left as-is (file-convention OG route).
- **Accepts:** every route self-canonicalizes (absolute, resolved from `metadataBase`); og:url/og:site_name
  emitted everywhere. ✓ verified (tests/e2e/seo-availability.spec.ts — graph shape, 8 routes, per-slug case study)

### 4. Availability strip (0.5) ✓ wording locked 2026-09
- [x] `AvailabilityBadge` leads the hero with the live-status dot (breathes via transform/opacity,
      frozen under reduced motion). Wording locked by Omar: "Open to work — on-site or remote"
      (in `content/profile.ts` — edit there to change it everywhere).
- [x] Social profiles demoted from buttons to quiet mono text-links with external-link glyphs, after the CTA row.
- **Accepts:** within 5 seconds of landing, a recruiter knows the availability and the next click. ✓ verified
  (tests/e2e/seo-availability.spec.ts — badge first in hero, above kicker; socials not buttons, after all CTAs)

### 5. Resume print stylesheet + PDF freshness (0.5) ✓ 2026-09
- [x] `@media print` pass on /resume: nav/footer/curtain/download-CTA suppressed, light ink-friendly
      theme forced over any on-screen toggle, Motion inline styles neutralized, headings kept with
      content, external/mailto links inlined as visible URLs.
- [x] Audit `public/omar-nouh-resume.pdf` (dated 2026-08-13) against current content — confirmed current by Omar 2026-09; regeneration stays out of scope until content changes.
- **Accepts:** Ctrl+P on /resume produces a designed one-pager; PDF matches the site. ✓ verified
  (tests/e2e/analytics-print.spec.ts — chrome stripped + theme pinned in print media, screen untouched)

### 6. Funnel analytics + Speed Insights (0.5) ✓ 2026-09
- [x] `track()` events on the actions that matter: contact submit, PDF download, email (mailto —
      the copy-email affordance is item 13), outbound GitHub/LinkedIn with placement dimension.
      Typed wrapper in `lib/analytics.ts`; `TrackedLink` keeps server components serializable.
- [x] Add `@vercel/speed-insights` for real-user Web Vitals (mounted in root layout).
- **Accepts:** within a week, the dashboard shows which CTAs recruiters actually press. ✓ verified
  locally (tests/e2e/analytics-print.spec.ts — events queue into `window.vaq` without the Vercel script;
  contact_submit fires only for submits that reach the server action)

---

## Tier 2 — content depth (the long pole, ~3–4 days)

### 7. Case-study rewrite pass (1–2) ✓ 2026-09
- [x] All 11 projects audited; the 5 thin MDX case studies (fos-kernel, tiny-compiler,
      32-bit-processor, cinema-booking, inventory-tracker) rewritten outcome-first:
      problem → approach → verifiable result.
- [x] Honest metrics wired into the key-metrics band — all 11 case studies now carry one
      (entries derive from the case-study text: subsystem/format/table counts, complexity
      guarantees, the 60.3% val accuracy, Oracle's 76-byte header). Fixed while wiring:
      Oracle's "76B" unit bug (reads as 76 billion; it's 76 bytes) and Omnitaps'
      constraint-framed band. Metrics policy 2026-09: measured benchmarks + scale numbers
      + adoption/usage (only when real and public).
- [x] Cross-links between related case studies via a structured `related` slug field
      (kernel ↔ compiler ↔ processor); explicit links lead Related, filter-derived fill the rest.
- **Accepts:** every case study states a problem, an approach, and a result a non-expert can
  verify. ✓ verified (tests/e2e/case-study.spec.ts — band + cross-links on fos-kernel)

### 8. About page narrative (0.5–1) ✓ 2026-09
- [x] Arc: the systems × AI intersection story, an explicit "what I'm looking for",
      beyond-code (triathlon/MUN/CP) framed as evidence of rigor — not a hobby list.
      Arc copy lives in `content/about.ts` (profile strings stay resume/JSON-LD-faithful);
      proof ladder + beyond-code claims all trace to the resume PDF.
- **Accepts:** a stranger can retell the story after 60 seconds. ✓ verified live on /about
  (thesis → layer ladder → internships → beyond-code → explicit ask → /contact)

### 9. Testimonials (0.5 + your input) `(needs-you: quotes + permission)` — carried from v1 #10
- [ ] 2–3 quotes from supervisors/mentors with name and role; permission confirmed before build.
- [ ] Stacked layout with reveals (calmer than the carousel for 2–3 items); on /about, linked from home.
- **Accepts:** named social proof on /about without new infrastructure.

### 10. Experience content pass (0.5) ✓ 2026-09
- [x] Bullets reframed to impact; tense consistent; dates/companies verified against the PDF
      (text extracted from `public/omar-nouh-resume.pdf` 2026-09: the three PDF-listed internships
      match exactly; the two pre-2024 Dell programs are site-only extras — kept, flagged to Omar).
      Copy rules live in `content/experience.ts` header (no invented metrics; `description` no
      longer duplicates `bullets[0]`).
- [ ] Pairs naturally with item 11 if both are in flight.

---

## Tier 3 — signature bets & polish

### 11. Experience scroll-story (1) — carried from v1 #9
- [ ] Pinned timeline scrub on desktop fine pointers; reduced-motion fallback = today's stacked timeline.
- **Accepts:** story mode where it lands, zero regression everywhere else.

### 12. Visual cohesion sweep (1)
- [ ] Section-header rhythm, spacing, typography audit across all routes.
- [ ] Footer upgrade: contact strip, last-updated date, colophon line.
- [ ] Dark/light parity on everything added since the theme system shipped.
- **Accepts:** no page reads as a template afterthought; both themes pass contrast.

### 13. One micro-delight (stretch, 0.5)
- [ ] Exactly one signature interaction — copy-email affordance with visible feedback
      is the leading candidate. Capped at one; polish sprawl is the enemy.

---

## Tier 4 — hardening & guardrails (~1.5 days)

### 14. Lighthouse CI (0.5)
- [ ] `@lhci/cli` in GitHub Actions with budgets (perf ≥ 90, a11y ≥ 95, SEO ≥ 95) on home, projects, one case study.
- **Accepts:** CI fails on regression, not on vibes.

### 15. Security headers (0.5)
- [ ] `next.config.ts` headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `frame-ancestors`.
- [ ] CSP in report-only mode first.
- **Accepts:** scanner clean; zero console breakage.

### 16. E2E expansion (0.5–1)
- [ ] Contact form spec: the three states (success / validation / network) — the conversion endpoint has no test today.
- [ ] Homepage smoke; axe a11y scan on core routes. 20 tests → ~30.
- **Accepts:** the contact flow is guarded like the nav is.

### 17. Cadence item
- [ ] Next minor-bump checklist; re-read `node_modules/next/dist/docs/` per AGENTS.md before touching conventions.

---

## Needs from Omar (blocking inputs) — answered 2026-09-09
1. Domain choice — **deferred**: site stays on vercel.app; item 1 and the Resend
   sender verification (item 2) stay open until picked. Runner-up: onouh.dev.
2. Availability wording — **done**: "Open to work — on-site or remote", live.
3. Testimonial quotes — **in motion**: request drafts ready in `testimonial-requests.md`;
   item 9 builds when 2–3 replies land.
4. Resume PDF — **confirmed current** (2026-08-13); item 5 is now just the print stylesheet.
5. Metrics policy — **decided** for item 7: measured benchmarks + scale numbers +
   adoption/usage (only when real and public).

## Judgement calls made in this draft (veto freely)
- The contact fake-success bug is Tier 0, not "hardening": a recruiter who submits
  and hears silence never comes back.
- Blog/writing excluded — you didn't select it as an available input.
- Screenshot work from v1 #6 stays parked — no assets exist; the gradient
  fallback is carrying the grid fine.
- v1 #9 and #10 are re-scoped as #11 and #9 here, not restarted.

---

## Archive — v1 (2026-05 → 2026-09)

Tier 1 (error pages, contact states, filter announcements, OG cards), Tier 2
(case-study template, card media system, mobile nav), and the theme system (v1 #8)
all shipped and verified — full detail in git history. Open items absorbed into
this plan: real screenshots (v1 #6, parked), scroll-story (→ #11), testimonials (→ #9).
