import type { ExperienceItem } from "./types";

/** Roles as listed in Resume.pages. */
export const experience: ExperienceItem[] = [
  {
    company: "e&",
    role: "Enterprise Security Intern",
    date: "Aug 2025",
    sortKey: "2025-08",
    description:
      "Evaluated enterprise-scale telecommunications and network infrastructure, analyzing low-level vulnerabilities and cyber defense architectures.",
    bullets: [
      "Evaluated enterprise-scale telecommunications and network infrastructure, analyzing low-level vulnerabilities and cyber defense architectures.",
      "Assessed Governance, Risk, and Compliance (GRC) frameworks, bridging the gap between low-level information security systems and high-level enterprise protocols.",
    ],
  },
  {
    company: "Future Career",
    role: "Business Process Engineering Intern",
    date: "Jul 2024",
    sortKey: "2024-07",
    description:
      "Architected API-driven automated workflows utilizing Activepieces, integrating third-party services to streamline complex business logic and data routing.",
    bullets: [
      "Architected API-driven automated workflows utilizing Activepieces, integrating third-party services to streamline complex business logic and data routing.",
      "Engineered programmatic data-parsing pipelines that successfully reduced manual data entry overhead by 50% and accelerated client engagement metrics by 25% within a two-month lifecycle.",
    ],
  },
  {
    company: "Dell Technologies",
    role: "Cloud Infrastructure Trainee",
    date: "Dec 2021",
    sortKey: "2021-12",
    description:
      "Analyzed enterprise cloud database architectures, evaluating hardware-software integration constraints across Dell infrastructure platforms.",
    bullets: [
      "Analyzed enterprise cloud database architectures, evaluating hardware-software integration constraints across Dell infrastructure platforms.",
      "Developed a foundational understanding of high-availability cloud deployments, bridging physical hardware limitations with scalable software solutions.",
    ],
  },
];

export function experienceChronological(): ExperienceItem[] {
  return [...experience].sort((a, b) => b.sortKey.localeCompare(a.sortKey));
}
