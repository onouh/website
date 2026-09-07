"use client";

import Link from "next/link";

/**
 * Client error boundary for route segments. Rendered when an unhandled
 * error bubbles past a page — gives users a designed recovery path instead
 * of the framework's default crash screen. Root layout stays mounted
 * (nav/footer chrome intact); for failures inside the root layout itself,
 * app/global-error.tsx takes over.
 */

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-[var(--gutter)] py-32 text-center">
      <p className="section-label">Something broke</p>
      <h1 className="mb-4 font-[family-name:var(--font-syne)] text-4xl font-bold">
        Unexpected error
      </h1>
      <p className="mb-8 max-w-md text-[var(--text-mid)]">
        The page hit a problem while rendering. Try again — or head home and
        browse from there.
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Home
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-8 font-[family-name:var(--font-jetbrains)] text-xs text-[var(--text-dim)]">
          digest: {error.digest}
        </p>
      ) : null}
    </section>
  );
}
