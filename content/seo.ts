import type { Metadata } from "next";
import { profile } from "./profile";

/** Public metadata — never include phone numbers. */
export const seoDescription = profile.tagline;

export const defaultMetadata: Metadata = {
  title: {
    default: `${profile.name} — ${profile.title}`,
    template: `%s — ${profile.name}`,
  },
  description: seoDescription,
  applicationName: profile.name,
  authors: [{ name: profile.name }],
  openGraph: {
    title: `${profile.name} — ${profile.title}`,
    description: seoDescription,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.title}`,
    description: seoDescription,
  },
  robots: { index: true, follow: true },
};
