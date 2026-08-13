import type { EducationItem } from "./types";

/**
 * Honors wording from Resume.pages: Summa Cum Laude / Félicitations du Jury.
 * Portfolio/index.html previously said Cum Laude; the CV is now source of truth.
 */
export const education: EducationItem[] = [
  {
    id: "asufe-uel",
    degree: "B.Sc. Computer & Artificial Intelligence Engineering",
    school: "Ain Shams University",
    schoolDetail: "Dual Degree — University of East London",
    year: "Expected 2028",
    detail:
      "Coursework: Operating Systems, Compiler Design, Logic Design, Data Structures & Algorithms, Artificial Intelligence, Discrete Mathematics",
    gpa: "GPA: 3.6",
  },
  {
    id: "baccalaureat",
    degree: "Baccalauréat Français",
    school: "Collège de la Sainte Famille",
    year: "2024",
    detail:
      "Highest Honors (Summa Cum Laude / Félicitations du Jury).",
    honors: "Summa Cum Laude / Félicitations du Jury",
  },
];

export const coursework = [
  "Operating Systems",
  "Compiler Design",
  "Logic Design",
  "Data Structures & Algorithms",
  "Artificial Intelligence",
  "Discrete Mathematics",
];
