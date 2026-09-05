import type { ReactNode } from "react";
import type { ProjectIconId } from "@/content/types";

const paths: Record<ProjectIconId, ReactNode> = {
  box: (
    <>
      <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" />
      <path d="M12 12 3 8.5" />
      <path d="m12 12 9-3.5" />
      <path d="M12 12v9" />
    </>
  ),
  cog: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 6-4 12" />
    </>
  ),
  film: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 5v14M17 5v14M3 9h4M17 9h4M3 15h4M17 15h4" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="0.5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.25" />
      <path d="m21 15-4.5-4.5L7 20" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 5.5v5c0 4.3 2.9 8.2 7 10.5 4.1-2.3 7-6.2 7-10.5v-5L12 3Z" />
      <path d="m9.5 11.5 2 2 3.5-4" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12.5 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </>
  ),
  graph: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="8" r="2.5" />
      <circle cx="9" cy="18" r="2.5" />
      <path d="M8.5 6.4 15.5 7.6" />
      <path d="M6.6 8.4 8.4 15.6" />
      <path d="M16.3 9.9 10.7 16.1" />
    </>
  ),
  car: (
    <>
      <path d="M4 16v-3.5a2 2 0 0 1 2-2h1.2l1.7-3.1a2 2 0 0 1 1.75-1.05h2.7a2 2 0 0 1 1.75 1.05l1.7 3.1H18a2 2 0 0 1 2 2V16" />
      <path d="M4 13.5h16" />
      <circle cx="8" cy="16.5" r="1.75" />
      <circle cx="16" cy="16.5" r="1.75" />
      <path d="M9.75 16.5h4.5" />
    </>
  ),
};

export function ProjectIcon({
  id,
  className = "h-5 w-5",
}: {
  id: ProjectIconId;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {paths[id]}
    </svg>
  );
}
