import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-[var(--gutter)] py-32 text-center">
      <p className="section-label">404</p>
      <h1 className="mb-4 font-[family-name:var(--font-syne)] text-4xl font-bold">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-[var(--text-mid)]">
        That route is not on this site. Head home or browse projects.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="btn btn-primary">
          Home
        </Link>
        <Link href="/projects" className="btn btn-outline">
          Projects
        </Link>
      </div>
    </section>
  );
}
