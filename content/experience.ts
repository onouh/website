import type { ExperienceItem } from "./types";

/**
 * Professional experience, newest first (`experienceChronological()` sorts by
 * `sortKey` regardless of source order).
 *
 * Verified against public/omar-nouh-resume.pdf (2026-08-13) — PLAN.md item 10:
 * the three internships (Dell AI 2026, e& 2025, Future Career 2024) match the
 * PDF's company/role/date exactly, and bullet wording follows the PDF where
 * they differ (e&: "system-level" vulnerabilities, not "low-level"). The two
 * early Dell programs are site-only extras not on the one-page resume; kept
 * as real history, flagged to Omar 2026-09 for a keep/drop decision.
 *
 * Copy rules for this file (item 10):
 * - bullets lead with impact: action verb → what it produced, past tense
 *   throughout (every role is a completed single-month program)
 * - numbers only where the PDF states them (no invented metrics); the 50%/25%
 *   figures are real and lead their bullet
 * - `description` is a one-line chapter lead for the story prototype — never
 *   a duplicate of bullets[0]
 */
export const experience: ExperienceItem[] = [
  {
    company: "Dell Technologies",
    role: "Artificial Intelligence Engineer Intern",
    date: "Aug 2026",
    sortKey: "2026-08",
    description:
      "Mapped how Dell's enterprise cloud platforms constrain — and enable — the software built on them.",
    bullets: [
      "Analyzed enterprise cloud database architectures, mapping the hardware–software integration constraints that govern Dell's infrastructure platforms.",
      "Evaluated how physical hardware limits shape high-availability cloud deployments, connecting infrastructure constraints to scalable software design.",
    ],
  },
  {
    company: "e&",
    role: "Enterprise Security Intern",
    date: "Aug 2025",
    sortKey: "2025-08",
    description:
      "Studied enterprise-scale telecom defense — from system-level vulnerabilities up to governance protocols.",
    bullets: [
      "Evaluated enterprise-scale telecommunications and network infrastructure, analyzing system-level vulnerabilities and the cyber defense architectures built to stop them.",
      "Assessed Governance, Risk, and Compliance (GRC) frameworks, connecting low-level security systems to the enterprise protocols that govern them.",
    ],
  },
  {
    company: "Future Career",
    role: "Business Process Engineering Intern",
    date: "Jul 2024",
    sortKey: "2024-07",
    description:
      "Automated a consultancy's data workflows end-to-end — 50% less manual entry, 25% faster client engagement.",
    bullets: [
      "Architected API-driven automated workflows in Activepieces, integrating third-party services to streamline complex business logic and data routing.",
      "Built programmatic data-parsing pipelines that cut manual data entry overhead by 50% and lifted client engagement metrics 25% within two months.",
    ],
  },
  {
    company: "Dell Technologies",
    role: "Marketing Star Bootcamp Intern",
    date: "Aug 2022",
    sortKey: "2022-08",
    description:
      "Closed a marketing bootcamp by pitching an initiative to strengthen the Dell ecosystem.",
    bullets: [
      "Studied how Dell Technologies positions its brand and product portfolio across market segments.",
      "Delivered the bootcamp's final pitch: an initiative to strengthen the Dell ecosystem.",
    ],
  },
  {
    company: "Dell Technologies",
    role: "Cloud Infrastructure Trainee",
    date: "Dec 2021",
    sortKey: "2021-12",
    description:
      "First look inside enterprise cloud infrastructure — where hardware constraints meet deployment design.",
    bullets: [
      "Trained on enterprise cloud infrastructure fundamentals, from database architecture to the hardware constraints behind high-availability deployments.",
    ],
  },
];

export function experienceChronological(): ExperienceItem[] {
  return [...experience].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}
