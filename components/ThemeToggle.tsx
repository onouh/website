"use client";

/**
 * Light/dark toggle. The site's default follows the OS (no data-theme
 * attribute — the CSS media query owns it); clicking writes an explicit
 * <html data-theme> and persists it in localStorage. The intro-curtain
 * boot script re-applies the stored choice before first paint, so reloads
 * never flash the wrong palette.
 *
 * The icon (sun ↔ moon) is driven purely by CSS scoped to the same
 * dark-selection selectors the token block uses — no React state, no
 * hydration mismatch, correct icon even before hydration completes.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const dark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };

  return (
    <button
      type="button"
      className="theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[var(--border-2)] text-[var(--text)] transition-transform duration-100 ease-out active:scale-95"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      {/* Moon: shown on light (click → dark). Sun: shown on dark (click → light). */}
      <svg
        aria-hidden
        className="theme-toggle-moon h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
      <svg
        aria-hidden
        className="theme-toggle-sun h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
