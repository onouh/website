import { profile } from "@/content/profile";

/**
 * JSON-LD structured data (PLAN.md item 3).
 *
 * `ProfilePage` + `Person` on the home route — the page whose canonical URL
 * IS the person's identity URL. Google's guidance is one primary entity per
 * page; /about is a narrative sub-page, so the graph lives here.
 *
 * The `Person` node is exported separately so child routes (case studies,
 * /about) can reference it by `@id` without duplicating fields — one node,
 * many pages, no conflicting facts for crawlers to reconcile.
 */

const PERSON_ID = "#person";

/** Stable node id: `${site}/#person` resolves to the same entity from any route. */
export function personId(siteUrl: string) {
  return `${siteUrl}${PERSON_ID}`;
}

function sameAs(social: readonly { href: string }[]) {
  return social.map((link) => link.href);
}

/** The shared `Person` node. `additionalProperty` carries the availability
 * line so the seeking window is machine-readable, not just visible. */
export function personNode(siteUrl: string) {
  return {
    "@type": "Person",
    "@id": personId(siteUrl),
    name: profile.name,
    jobTitle: profile.title,
    description: profile.tagline,
    email: `mailto:${profile.email}`,
    url: siteUrl,
    image: `${siteUrl}/opengraph-image`,
    homeLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Cairo",
        addressCountry: "EG",
      },
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Ain Shams University" },
      { "@type": "CollegeOrUniversity", name: "University of East London" },
    ],
    knowsAbout: [
      "C",
      "C++",
      "Python",
      "Java",
      "C#",
      "VHDL",
      "Operating Systems",
      "Compiler Design",
      "FPGA",
      "Digital Logic",
      "Machine Learning",
      "PyTorch",
      "SQL",
    ],
    sameAs: sameAs(profile.social),
    mainEntityOfPage: `${siteUrl}/about`,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "availability",
        value: profile.availability,
      },
    ],
  };
}

/** Home route graph: the profile page and the person it is about. */
export function homeGraph(siteUrl: string) {
  const person = personNode(siteUrl);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": `${siteUrl}/#profilepage`,
        url: siteUrl,
        title: `${profile.name} — ${profile.title}`,
        mainEntity: { "@id": personId(siteUrl) },
        dateModified: new Date().toISOString().slice(0, 10),
      },
      person,
    ],
  };
}

/** Serialize for the <script> tag, escaping `<` per the Next.js JSON-LD guide. */
export function serializeJsonLd(graph: unknown) {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
