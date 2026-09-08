# UI/UX Improvement Plan

Status legend: [ ] todo · [~] in progress · [x] done

Working sequence: Tier 1 in one sitting → Tier 2 items 5+6 together (shared assets) → pick 8 or 9.

---

## Tier 1 — quick wins, high leverage (half a day each)

### 1. Custom 404 + error pages
- [x] `app/not-found.tsx` — *(already existed*; branded 404 with nav/footer chrome, verified live.)
- [x] `app/error.tsx` — client error boundary with reset affordance + digest display; `app/global-error.tsx` added for root-layout failures.
- **Accepts:** broken URLs render a designed page with nav/footer; a "reset" button recovers from client errors. ✓ verified

### 2. Contact form states
- [x] Field-level inline validation (name/email/message) shown on blur + on submit attempt — client rules mirror the server action's exactly.
- [x] Submit button busy state (disabled, spinner + label swap) while the request is in flight; client-invalid submits skip the server round-trip.
- [x] Success/error panels carried by one `aria-live` polite region (success keeps the mailto fallback link).
- [x] Errors wired to inputs via `aria-describedby` + `aria-invalid`; `noValidate` so custom UX owns the flow.
- **Accepts:** submitting gives visible, announced feedback in all three outcomes (success, validation error, network error). ✓ verified

### 3. Projects filter announcements + empty state
- [x] `aria-live="polite"` region announcing "Showing N of M projects — <Filter>" on every chip change (full filter labels, not chip ids).
- [x] Designed empty state with escape-hatch link back to All (both morphing and reduced-motion branches).
- **Accepts:** screen readers hear the result count on every filter change; empty filter renders a designed panel. ✓ verified

### 4. OG / meta cards
- [x] Root `app/opengraph-image.tsx` — *(already existed.)*
- [x] Per-page metadata — *(already existed*: every route exports unique titles; `[slug]` uses `generateMetadata`.)
- [x] Dynamic OG for project case studies (`app/projects/[slug]/opengraph-image.tsx`) with the project name, language, and summary.
- **Accepts:** shared links show a designed card; every route has a unique title/description. ✓ verified (OG route 200, meta tags present)

---

## Tier 2 — structural (a focused day each)

### 5. Case-study template (projects/[slug])
- [x] Sticky section nav: floating rounded bar pinning under the site nav, chips derived from the MDX H2 outline (`getProjectSections` + h2 anchor ids); position-based scrollspy tuned to the anchor rest line so a clicked chip is always the active one.
- [x] Key-metrics band reusing the CountUp system (`Project.metrics?`, honest numbers grounded in each case study's text; band omitted when absent).
- [x] Related-projects footer strip: shared-filter projects first, falls back to the rest.
- [ ] Screenshot/lightbox treatment — covered by item 6's media system once real screenshots exist.
- **Accepts:** case studies read like product pages, not walls of text. ✓ verified (tests/e2e/case-study.spec.ts, 5 tests)

### 6. Media in the project grid
- [x] Card media system: `Project.thumbnail?` field → full-bleed 16:9 `next/image` banner (fill + `sizes`, lazy, zero CLS), slow hover zoom with `motion-reduce` opt-out.
- [x] Gradient fallback: deterministic per-slug brand gradient + icon watermark that brightens on hover.
- [ ] Real screenshots per project — the wiring is done; each asset is one file in `public/projects/` + one `thumbnail:` line in the project entry.
- **Accepts:** grid reads visually, not as a text list; CLS stays at 0. ✓ verified (image path via `/_next/image` optimizer, fallback on all 11 cards, 4 distinct gradients)

### 7. Mobile nav pass
- [x] Animated drawer in the curtain's vocabulary: clip-path wipe in (staggered link rise), symmetric wipe-out on close — no unmount pop; dimmed backdrop (tap-to-dismiss).
- [x] Focus trap: focus moves to the first link on open, Tab/Shift+Tab cycle inside the header with wrap at both boundaries, Esc and backdrop close, focus restores to the burger; body scroll locked for the drawer's lifetime.
- [x] Scrollspy: the /resume page's embedded sections (Education, Skills, Experience, Projects) spotlight their nav routes as they cross the reading band (`useScrollSpy`, amber signal, no aria-current claim); degrades to route highlighting if IO never fires.
- **Accepts:** menu opens/closes with the site's motion language, keyboard-safe. ✓ verified (tests/e2e/mobile-nav.spec.ts, 5 tests)

---

## Tier 3 — signature bets

### 8. Light theme + theme system
- [x] Light palette — *(pre-existed*: the token block's default IS the light theme; dark was the media-query override.)*
- [x] Persisted toggle (`ThemeToggle` in the nav): OS-follow by default, explicit `<html data-theme>` + localStorage on click, duplicated dark token block scoped to `[data-theme="dark"]` so the choice beats the OS.
- [x] No flash on load: the intro-curtain boot script applies the stored theme pre-paint (same pattern as the curtain itself); `theme-color` viewport tint added for browser chrome.
- [x] Light-mode audit: hardcoded-color sweep — OG/error shells are static-by-design; effect layers (aurora/spotlight/curtain/drawer) were already token-driven; the one real breaker (`text-red-400` at 2.8:1 on light) moved to the `--red` token.
- **Accepts:** both themes pass contrast checks; no FOUC on reload. ✓ verified (tests/e2e/theme.spec.ts, 4 tests — OS default, toggle + persistence, explicit-over-OS, accent flip)

### 9. Experience page as scroll story
- [ ] Pinned timeline scrub: each role's details reveal as the connecting line draws itself.
- [ ] Reduced-motion fallback: plain stacked timeline (already the current behavior).
- **Accepts:** story mode on desktop fine pointers; everything else unchanged.

### 10. Testimonials section
- [ ] 2–3 quotes from internship supervisors/mentors.
- [ ] Reuses the (latch-hardened) carousel system or a simple stacked layout with reveals.
- **Accepts:** social proof on home or about page without new infrastructure.
