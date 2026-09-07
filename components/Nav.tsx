"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollProgress } from "@/components/motion";
import { navItems } from "@/content/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll edge effect: separate only once content passes underneath (§12).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Outside-tap dismissal: any pointerdown that starts outside the header
  // (menu button included via its own toggle) closes the menu. Covers touch
  // and mouse; pointerdown runs before the button's click-toggle, so a tap
  // on the button closes-and-reopens, which the toggle then resolves to
  // closed — net effect: outside taps dismiss, button taps toggle normally.
  const headerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onPointerDownOutside = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDownOutside);
    return () =>
      document.removeEventListener("pointerdown", onPointerDownOutside);
  }, [open]);

  return (
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
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`nav-link text-[0.825rem] font-medium uppercase tracking-[0.06em] transition-colors ${
                  isActive(pathname, item.href)
                    ? "text-[var(--text)]"
                    : "text-[var(--text-mid)] hover:text-[var(--text)]"
                }`}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                data-active={isActive(pathname, item.href) ? "" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="nav-burger inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[var(--border-2)] text-[var(--text)] transition-transform duration-100 ease-out active:scale-95 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
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
      </nav>
      {open ? (
        <ul
          id="mobile-nav"
          className="menu-panel flex flex-col gap-1 px-[var(--gutter)] py-4 md:hidden"
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={`mobile-nav-link block py-2 text-sm uppercase tracking-[0.06em] ${
                  isActive(pathname, item.href)
                    ? "text-[var(--amber)]"
                    : "text-[var(--text-mid)]"
                }`}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
