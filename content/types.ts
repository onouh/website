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

export type ProjectFilterId = "os" | "compilers" | "fpga" | "ml" | "software";

export type ProjectIconId = "box" | "cog" | "code" | "film" | "cpu" | "image";

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
};
