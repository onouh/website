"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems } from "@/content/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
      <nav
        className="flex items-center justify-between px-6 py-4 md:px-12"
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
                className={`text-[0.825rem] font-medium uppercase tracking-[0.06em] transition-colors ${
                  isActive(pathname, item.href)
                    ? "text-[var(--text)]"
                    : "text-[var(--text-mid)] hover:text-[var(--text)]"
                }`}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius)] border border-[var(--border-2)] text-[var(--text)] md:hidden"
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
          className="flex flex-col gap-1 border-t border-[var(--border)] px-6 py-4 md:hidden"
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block py-2 text-sm uppercase tracking-[0.06em] ${
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
