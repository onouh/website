import type { Profile } from "./types";

/** Source of truth: Resume.pages (extracted 2026-08-13). */
export const profile: Profile = {
  name: "Omar Nouh",
  firstName: "Omar",
  lastName: "Nouh",
  title: "CS & AI Engineering",
  location: "Cairo, Egypt",
  email: "onouh7@gmail.com",
  phones: [{ display: "+20 (120) 006-3055", tel: "+201200063055" }],
  tagline:
    "Third-year Computer and Artificial Intelligence Engineering student focused on cross-stack development, from hardware architecture to scalable software.",
  availability: "Open to work — on-site or remote",
  summary: [
    "Third-year Computer and Artificial Intelligence Engineering student focused on cross-stack development, from hardware architecture to scalable software. Experienced in C/C++, Python, and C# through the hands-on engineering of custom OS kernels, normalized enterprise databases, and deep learning pipelines.",
    "I'm drawn to the intersection of low-level systems thinking and high-level intelligent systems — kernels, compilers, FPGA datapaths, and learning pipelines in the same toolkit.",
  ],
  beyond:
    "Active in Competitive Programming, Model United Nations (MUN), and Triathlons — all of which demand the same rigor I bring to code.",
  stats: [
    { value: "3.6", label: "GPA at Ain Shams University" },
    { value: "5+", label: "Professional internships completed" },
    { value: "12+", label: "Engineering projects built" },
    { value: "3", label: "Languages spoken natively" },
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "French", level: "Native" },
    { name: "Arabic", level: "Native" },
    { name: "Spanish", level: "Proficient" },
  ],
  social: [
    {
      label: "LinkedIn",
      href: "https://linkedin.com/in/onouh",
      short: "linkedin.com/onouh",
    },
    {
      label: "GitHub",
      href: "https://github.com/onouh",
      short: "github.com/onouh",
    },
  ],
};
