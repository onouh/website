"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ScrollProgress } from "@/components/motion";
import { navItems } from "@/content/nav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useScrollSpy } from "@/components/useScrollSpy";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Pages that embed sections belonging to other nav routes. While such a
 * page scrolls, the nav spotlights the route whose section is in the
 * reading band (§ scrollspy) — /resume is a compressed portfolio, so its
 * sections light up Skills / Experience / Projects / Education in turn. */
const SPY_MAP: Record<string, { id: string; href: string }[]> = {
  "/resume": [
    { id: "resume-education", href: "/education" },
    { id: "resume-skills", href: "/skills" },
    { id: "resume-experience", href: "/experience" },
    { id: "resume-projects", href: "/projects" },
  ],
};

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // `closing` keeps the panel mounted through the wipe-out animation.
  const [closing, setClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLUListElement | null>(null);
  const burgerRef = useRef<HTMLButtonElement | null>(null);

  const spySections = SPY_MAP[pathname];
  const spiedId = useScrollSpy(spySections?.map((s) => s.id) ?? []);
  const spiedHref = spiedId
    ? (spySections?.find((s) => s.id === spiedId)?.href ?? null)
    : null;

  /** Highlight precedence: current route > spied section > nothing. */
  const stateFor = (href: string): "active" | "spy" | null =>
    isActive(pathname, href) ? "active" : spiedHref === href ? "spy" : null;

  // Scroll edge effect: separate only once content passes underneath (§12).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Close through the wipe-out: the panel stays mounted until its exit
   * animation ends, then focus returns to the burger. */
  const closeMenu = useCallback(() => {
    setOpen((prevOpen) => {
      if (!prevOpen) return false;
      setClosing(true);
      return false;
    });
  }, []);

  const onPanelAnimationEnd = (event: React.AnimationEvent) => {
    // animationend bubbles — only react to the panel's own wipe-out.
    if (!closing || event.animationName !== "menu-wipe-out") return;
    setClosing(false);
    burgerRef.current?.focus({ preventScroll: true });
  };

  // Drawer lifecycle: scroll lock + focus trap + initial focus. The burger
  // and the panel's links are the only focusables reachable while open.
  useEffect(() => {
    if (!open) return;
    const root = headerRef.current;
    if (!root) return;

    panelRef.current
      ?.querySelector<HTMLAnchorElement>("a[href]")
      ?.focus({ preventScroll: true });

    const focusables = () =>
      [...root.querySelectorAll<HTMLElement>("a[href], button")].filter(
        (el) => el.getClientRects().length > 0,
      );

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || !root.contains(current))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeMenu]);

  // Scroll lock for the drawer's lifetime (open through wipe-out).
  useEffect(() => {
    if (!open && !closing) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open, closing]);

  // Outside-tap dismissal: any pointerdown that starts outside the header
  // (backdrop taps included — it renders outside the header) closes the
  // menu. Covers touch and mouse; pointerdown runs before the button's
  // click-toggle, so a tap on the button closes-and-reopens, which the
  // toggle then resolves to closed — net effect: outside taps dismiss,
  // button taps toggle normally.
  useEffect(() => {
    if (!open) return;
    const onPointerDownOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) closeMenu();
    };
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownOutside);
  }, [open, closeMenu]);

  const drawerVisible = open || closing;

  return (
    <>
      {/* Dimmed page behind the drawer. Sits below the fixed header but
           above content; taps land here and the outside-pointerdown handler
           dismisses. Pointer-events only while visible. */}
      <div
        aria-hidden
        className={`menu-backdrop md:hidden ${drawerVisible ? "menu-backdrop--on" : ""}`}
      />
      <header
        ref={headerRef}
        className="site-nav fixed inset-x-0 top-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md"
        data-scrolled={scrolled ? "" : undefined}
      >
        <ScrollProgress />
        <nav
          className="flex items-center justify-between px-[var(--gutter)] py-4"
          aria-label="Primary"
        >
          <Link
            href="/"
            className="font-[family-name:var(--font-jetbrains)] text-[0.9rem] tracking-wide text-[var(--amber)]"
          >
            ON_
          </Link>
          <ul className="hidden list-none items-center gap-8 md:flex">
            {navItems.map((item) => {
              const state = stateFor(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`nav-link text-[0.825rem] font-medium uppercase tracking-[0.06em] transition-colors ${
                      state === "active"
                        ? "text-[var(--text)]"
                        : state === "spy"
                          ? "text-[var(--amber-dim)]"
                          : "text-[var(--text-mid)] hover:text-[var(--text)]"
                    }`}
                    aria-current={state === "active" ? "page" : undefined}
                    data-active={state === "active" ? "" : undefined}
                    data-spy={state === "spy" ? "" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              ref={burgerRef}
            type="button"
            className="nav-burger inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[var(--border-2)] text-[var(--text)] transition-transform duration-100 ease-out active:scale-95 md:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => (open ? closeMenu() : setOpen(true))}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden className="flex flex-col gap-1.5">
                <span
                  className={`block h-px w-4 bg-current transition ${open ? "translate-y-1 rotate-45" : ""}`}
                />
                <span className={`block h-px w-4 bg-current ${open ? "opacity-0" : ""}`} />
                <span
                  className={`block h-px w-4 bg-current transition ${open ? "-translate-y-1 -rotate-45" : ""}`}
                />
              </span>
            </button>
          </div>
        </nav>
        {drawerVisible ? (
          <ul
            id="mobile-nav"
            ref={panelRef}
            className="menu-panel flex flex-col gap-1 px-[var(--gutter)] py-4 md:hidden"
            data-closing={!open && closing ? "" : undefined}
            onAnimationEnd={onPanelAnimationEnd}
          >
            {navItems.map((item, index) => {
              const state = stateFor(item.href);
              return (
                <li
                  key={item.href}
                  style={{ "--i": index } as CSSProperties}
                  className="menu-panel-item"
                >
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className={`mobile-nav-link block py-2 text-sm uppercase tracking-[0.06em] ${
                      state === "active"
                        ? "text-[var(--amber)]"
                        : state === "spy"
                          ? "text-[var(--amber-dim)]"
                          : "text-[var(--text-mid)]"
                    }`}
                    aria-current={state === "active" ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </header>
    </>
  );
}
