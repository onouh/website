import type { Metadata } from "next";
import { profile } from "./profile";
import { getSiteUrl } from "@/lib/site";

/** Public metadata — never include phone numbers. */
export const seoDescription = profile.tagline;

export const defaultMetadata: Metadata = {
  title: {
    default: `${profile.name} — ${profile.title}`,
    template: `%s — ${profile.name}`,
  },
  description: seoDescription,
  applicationName: profile.name,
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description: seoDescription,
    siteName: profile.name,
    locale: "en_US",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description: seoDescription,
  },
  robots: { index: true, follow: true },
};

/** Per-route metadata: canonical self-URL + og:url on top of the shared
 * defaults (PLAN.md item 3). Paths are resolved against `metadataBase`, so
 * they stay relative and the domain lives in exactly one place
 * (`NEXT_PUBLIC_SITE_URL` → `getSiteUrl()`). `openGraph` is not deeply
 * merged by Next, so the defaults are spread here — pages can still
 * override individual fields via `extra.openGraph` (url is forced last). */
export function routeMetadata(path: string, extra: Metadata = {}): Metadata {
  return {
    ...extra,
    alternates: { canonical: path },
    openGraph: {
      ...defaultMetadata.openGraph,
      ...(extra.openGraph ?? {}),
      url: path,
    },
  };
}
