export type NavItem = {
  href: string;
  label: string;
};

export type SocialLink = {
  label: string;
  href: string;
  short?: string;
};

export type Phone = {
  display: string;
  tel: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type SpokenLanguage = {
  name: string;
  level: string;
};

export type Profile = {
  name: string;
  firstName: string;
  lastName: string;
  title: string;
  location: string;
  email: string;
  phones: Phone[];
  tagline: string;
  summary: string[];
  beyond: string;
  stats: Stat[];
  languages: SpokenLanguage[];
  social: SocialLink[];
};

export type ExperienceItem = {
  company: string;
  role: string;
  date: string;
  sortKey: string;
  description: string;
  bullets: string[];
};

export type EducationItem = {
  id: string;
  degree: string;
  school: string;
  schoolDetail?: string;
  year: string;
  detail: string;
  gpa?: string;
  honors?: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type ProjectFilterId =
  | "os"
  | "compilers"
  | "fpga"
  | "systems"
  | "ml"
  | "software";

export type ProjectIconId =
  | "box"
  | "cog"
  | "code"
  | "film"
  | "cpu"
  | "image"
  | "shield"
  | "layers"
  | "globe"
  | "graph"
  | "car";

export type Project = {
  slug: string;
  name: string;
  icon: ProjectIconId;
  lang: string;
  summary: string;
  tags: string[];
  filters: ProjectFilterId[];
  featured?: boolean;
  bullets?: string[];
  repo?: string;
  /** Card thumbnail, served from /public (e.g. "/projects/veripay.webp")
   * via next/image. Omit for the deterministic gradient fallback. */
  thumbnail?: string;
  /** Headline numbers for the case-study metrics band. Values support the
   * CountUp format ("26", "70B", "5+", "3.6"). Keep them honest — each
   * must be derivable from the case study text. */
  metrics?: { value: string; label: string }[];
};
