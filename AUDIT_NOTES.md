# Audit — Freebuff Desktop (2026-09-10)

**Scope:** 5 changed files (`PLAN.md`, `next.config.ts`, `app/api/csp-report/route.ts`, plus the home page context), 72 source files read, 33 e2e tests run, `npm run build` clean.

**Verifier behavior:** `npm run build` passed; `npx playwright test` = 32 passed, 1 failed. The failure is on the contact-success state test.

---

## Scores

| Dimension | Score | Note |
|-----------|-------|------|
| SPEC | 8/10 | Strong recruiter-conversion spec was fleshed out and mostly verified. |
| DESIGN | 6/10 | Clean data/content/lib split; one over-loaded component and one incomplete pipeline. |
| CORRECTNESS | 6/10 | Build clean, suite almost green, but contact success is not reliably surfaced in automated runs. |
| QUALITY | 6/10 | Dense with intent and little dead scaffolding; a few removable repetitions and one very heavy module. |

---

## SPEC — 8/10

The request was `/audit`, so the spec is *this repo as a portfolio product*: recruiter gets who/what/availability fast, proof underneath, truthful contact, works in both themes and on mobile.

What's being met well:
- JSON-LD `ProfilePage` + `Person` on home (`lib/jsonld.ts`, inline `<script>`)
- Per-route canonical + `og:url` + `og:site_name` via `routeMetadata()` (`content/seo.ts`)
- Availability as first hero line (`components/AvailabilityBadge.tsx`, copy in `content/profile.ts`)
- Socials demoted below CTAs to quiet mono links
- Contact rewritten out of fake-success trap (`app/actions/contact.ts`)
- Honeypot + fill-time guard (3s floor) in the server action
- Resume print stylesheet + analytics queue probe (`tests/e2e/analytics-print.spec.ts`)
- Funnel analytics wired to recruiter-visible CTAs (`lib/analytics.ts`, `TrackedLink`, `ContactForm`)
- Security headers + report-only CSP with ingesting endpoint (`next.config.ts`, `app/api/csp-report/route.ts`)
- Plan that names what's left and why (`PLAN.md`)

Top gaps, by how much they'd raise SPEC:
1. **Tier 0 still has an open production item with no live evidence.** Item 1 (custom domain / `NEXT_PUBLIC_SITE_URL`) is deferred, and CSP is still report-only. The "truthful contact" and "security headers" wins are real but partial: truthful email only on the vercel.app deployment, CSP only watching not enforcing. Highest-value close = finish item 1 + CSP flip as one combined production pass and re-verify contact on the real domain.
2. **The one funnel gap hinted at is still unbuilt.** Item 13's leading candidate is "copy-email affordance with visible feedback." `/contact` already has the email as a `mailto:` link, but there's no visible copy affordance and no feedback for the *defensibility* outcome a recruiter actually wants.
3. **Business-truth layer is verified once by hand, not continuously.** Item 1's Prod test submission is a historical manual send (2026-09-09), not a current automated probe. Appropriate given secrets, but it means the "contact works end-to-end" claim is proven once, not owned by the suite.

---

## DESIGN — 6/10

Praised part: source-of-truth prose in `content/*`, pure helpers in `lib/*` (`site.ts`, `jsonld.ts`, `analytics.ts`, `project-mdx.tsx`), thin pages, contact action owns its own validation/state shape.

Weakened part: three concerns collapse together in one place and one interactivity module is unusually large for a portfolio.

1. **`components/FeaturedCarousel.tsx`** owns physics, gesture tracking, auto-advance lifecycle, pointer-capture safety net, index normalization, clone-strip rendering, depth styling, and a11y controls in one 600+ line component. It works and is clearly written, but a later change to pause behavior, spring backend, or auto-advance latch touches the same module that owns pointer history, velocity estimation, and the settle watchdog. Honest owners: `useCarouselFlight`, `useCarouselGesture`, `useCarouselAuto`, plus a thin view.
2. **`app/api/csp-report/route.ts`** is correct but report-only + log-only sink: ingest, filter one noisy directive (`script-src-elem`), return acknowledged/logged. No structured routing, no threshold noise suppression beyond that one directive, no alerting path. The plan's implied contract ("watch, then tighten/flip/make actionable") is a second owner that hasn't been added; this is by-design-incomplete, not badly structured, but it is a placeholder shape.
3. **`app/contact/page.tsx` + `components/ContactForm.tsx`** duplicate validation shape across server and client (name length, email regex, message min/max). Client copy is the one most likely to drift from the server when a rule changes. One owner — a single `contactValidation` contract exported from the action module and reused client-side — removes that drift surface.

---

## CORRECTNESS — 6/10

I ran the build and the suite; I read the main interaction surfaces rather than re-proving every motion path.

The failed test is the main correctness signal:
- `tests/e2e/contact-spam.spec.ts:102` — *human-paced submission is stored and offers the mailto fallback* timed out on `"Saved. If you prefer, you can also email me directly."` being visible.

Context that matters:
- The other contact state tests passed (honeypot skip, too-fast skip, invalid-blocked).
- The analytics test that submits a human-paced valid form *did* reach the server action and queue `contact_submit`.
- So validation and spam guards work; the honest success state on the client is not reliably rendering in that test's window.

Concrete behavioral gaps:
1. **Contact success state is not deterministically surfaced in the suite today.** Most likely timing: server returns `{ok:true, sentVia:"stored", mailto}`, client shows the stored-message copy, but the test's `waitForTimeout(3500)` + submit doesn't reliably leave the status region visible before the 7s assertion budget is consumed. This is a real correctness gap in the audited artifact, not just a flaky test, because Tier 0's whole win is "every submit path ends in a truthful visible state." Fix belongs either in the action/UI (make success render more predictably/eagerly) or in the test (await the status region, not the text).
2. **One verification path is historical, not current.** The Prod Resend success path was verified once by hand; there's no current automated end-to-end probe of the Resend path itself, and no CI that can reach it without prod secrets.
3. **`public/intro-boot.js` is a decoy, not dead, but worth naming.** It says it's never loaded; real boot is inlined in `IntroCurtain.tsx`. Correct, but one more file a reviewer must dismiss as "not the source of truth."

Everything else probed behaves as advertised:
- Theme follows OS, persists with no flash, toggle flips icon
- SEO graph + canonicals + og:url on all 8 routes
- Availability above kicker; socials not buttons and after CTAs
- Carousel dots, wraps, stop-latch covered by invariants
- Case-study nav scrollspy + related-links order covered
- Resume print strips chrome and forces light
- Mobile drawer focus trap / scroll lock / backdrop / wipe-out covered

---

## QUALITY — 6/10

Lean for what it does; no random utils dump, no copied component patterns, no obvious half-removed experiment. But a few places are heavier than the same behavior needs.

Concrete things to delete or compress, ordered by impact:
1. **`components/FeaturedCarousel.tsx`** is the single biggest quality sink. A portfolio homepage carousel should not be the most physiologically-detailed gesture system in the repo. Same behavior — circular strip, spring settle, clone-hop wrap, dot/tab/keyboard control, user-yielding auto-advance, hover/focus pause — can be expressed with less bespoke analytic spring code and fewer refs by delegating to smaller flight/gesture/auto primitives. Highest-value move: extract those pieces so the file stops being the app's physics textbook.
2. **Duplicate contact validation (server + client).** One shared contract removes drift risk and saves the client copy. Small in lines, real in maintenance surface.
3. **`next.config.ts`** hardcodes a long permissions string and an inline report-only CSP. Fine now, but the CSP blob is exactly the kind of thing that should live in a single source string/helper once it gets tightened toward enforcement; right now it's a multi-line inline blob edited by hand on every directive change.
4. **`components/IntroCurtain.tsx`** inlines two JS snippets via `dangerouslySetInnerHTML` — defensible (pre-paint, zero request), but it's the only place in the app reaching for that API, and the one place a reviewer must pause to verify escaping. A tiny note or small shared `inlineScript` helper would make intent and safety posture obvious; as-is it's correct but not as obviously safe as the rest of the file.
5. **`public/intro-boot.js`** is documentation pretending to be a file. Remove it or make it clearly a comment archive; it adds a file to navigate for no runtime reason.

---

## Most valuable next pass

Finish the production contact + CSP loop and lock the contact-success contract under test.

That means: get the real domain / `NEXT_PUBLIC_SITE_URL` live, verify the Resend sender on the real domain, flip CSP from report-only to enforcing once the noise is understood, and make the contact success state deterministically testable in CI.

Why this first: today's strongest work (truthful contact, security headers, structured data, analytics) is partly "works on the toy deployment" until the real domain, real sender, and real CSP posture are in place, and the one automated failure in the suite is on exactly the contact-success surface that Tier 0 was written to protect.

---

## Applied: apple-design review

Reviewed the audited artifact against Apple's *Designing Fluid Interfaces* / *Principles of Great Design* framing. The fit is uneven in a way that's useful: the part that already thinks in springs is strong, and the part that still thinks in jank or decoration is where the design slot is leaking correctness and craft.

### Specific remarks

1. **`components/FeaturedCarousel.tsx` is the right home for this skill.** The audit already called it out as one over-loaded component. From the Apple lens, the bigger issue is that it is currently doing the hard fluid-interface work (pointer capture, velocity handoff, settle detection, interruptible spring settle, snap projection) inside a 600+ line view. That converges correctness and design risk in one file: if the spring launch or velocity estimate drifts, the same bug makes the motion feel stiff *and* makes the index or wrap state wrong. Apple's recommendation is the mirroring move: extract the flight/gesture/auto primitives so the file is a carousel *using* fluid primitives, not a carousel *owning* them.

   The good part: it already does the things Apple treats as table stakes for a dragged strip — 1:1 dragging with grab offset respect, pointer capture so tracking survives leaving the element, and velocity-based snap projection at release rather than nearest-boundary-from-current-position. The gap is whether the motion math is expressed in Apple's two-parameter language (damping/response, or the web equivalent `bounce`/`duration`) with the right defaults — critically damped for ordinary UI transitions, slightly under-damped only when the gesture itself carried momentum. That distinction is what separates "snappy+safe" from "flick feels real" and from "bounce on something that just landed feels accidental."

2. **The carousel's motion budget should be audited, not just its feature set.** Fluid-interface design is not "more springing." It is: respond on pointer-down, animate from the live presentation value on every interrupt, hand off the finger's velocity into the continue animation, project momentum to choose the landing index, and let the user grab mid-flight and reverse. The audit's failure mode is exactly one of these seams: an interruptible motion system is only as honest as its settle/latch logic, and if the auto-advance latch fights a gesture that hasn't fully settled, the interface will clearly *not* feel like direct manipulation. That is both a correctness bug (tests can miss it because it is timing/velocity dependent) and a design failure (the phase change from "I'm moving this" to "now it decides" is exactly where fluid interfaces lose users).

3. **Contact form is not a motion surface; review it for the lower-level Apple rules instead.** The carousel is where springs matter. For `/contact`, the relevant Apple-framing questions are: response latency on submit, truthful feedback tied to the causal outcome, and whether the four feedback kinds are used deliberately. The audit's existing note — that stored-message success is not reliably surfaced in the suite — is both a correctness issue and a design issue, because the whole win was to end every submit path in a visible, honest state. If the success copy only shows intermittently in CI, then the interface is not reliably giving completion feedback, which is the one feedback kind this feature most needs to own.

4. **CSP and security headers are not motion, but they are agency and responsibility.** Under the Apple foundations, the security posture lands under agency (don't silently lock the user into a path they didn't choose) and responsibility (protect the user's entry point). The current posture is honestly reported: strong hard headers, and CSP that is report-only with a real ingest path that already filters one noisy directive. That is the correct watch-step posture given a fresh production surface. The design note is simply that the "flip to enforcing" step should be treated like the contact win above — paired actions, re-verified together, not one defended in isolation.

5. **Design foundations, short version.** Purpose and simplicity: the repo is lean and specific, which is the right shape for a recruiter product. Craft is the weak axis the audit already named — in Apple terms, craft is exactly where the carousel physics textbook and the duplicated contact validation sit. Delight is not a separate decoration step here; it is the result of making the carousel motion honestly interruptible and making contact feedback deterministically visible. Familiarity is also worth one line: the mobile drawer behavior (focus trap, scroll lock, backdrop, wipe-out) should be reviewed against expected platform behavior, because that is where a portfolio becomes "feels native" or "feels custom in a bad way."

### Concrete recommended close-out, in priority order

1. Extract the carousel's spring/flight/gesture/auto pieces into smaller owners, and review the motion math against damping/response defaults: critically damped for standard UI transitions, slight bounce reserved for true momentum carry.
2. Make contact success state deterministically testable and visibly owned in CI — either fix the client success rendering/timing or make the test await the status region, not a specific string after a fixed pause.
3. Treat CSP flip-to-enforcing and real-domain contact verification as one combined production pass, not two separate completions.
4. Revisit mobile drawer behavior against platform expectations (navigation on the left/top-left of macOS, predictable exit, no trapped state) as part of the craft pass, not as a cosmetic tweak.

(End of file - total 106 lines)