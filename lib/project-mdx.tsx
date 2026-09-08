import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import { projects } from "@/content/projects";

/** Stable anchor id for an H2 heading — must match getProjectSections. */
export function slugifyHeading(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Flatten MDX children (string | element tree) into plain heading text. */
function headingText(children: unknown): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(headingText).join("");
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    typeof (children as { props?: { children?: unknown } }).props?.children !==
      "undefined"
  ) {
    return headingText((children as { props: { children: unknown } }).props.children);
  }
  return "";
}

const components: MDXComponents = {
  h2: (props) => {
    const id = slugifyHeading(headingText(props.children));
    return (
      <h2
        id={id}
        // Scroll margin clears the fixed nav + sticky section bar.
        className="mt-10 mb-3 scroll-mt-[136px] font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-[var(--text)] first:mt-0"
        {...props}
      />
    );
  },
  p: (props) => (
    <p className="mb-4 text-[var(--text-mid)] leading-[1.8]" {...props} />
  ),
  ul: (props) => (
    <ul className="mb-4 list-disc space-y-2 pl-5 text-[var(--text-mid)]" {...props} />
  ),
  li: (props) => <li className="leading-relaxed" {...props} />,
  strong: (props) => <strong className="font-medium text-[var(--text)]" {...props} />,
};

export async function getProjectBody(slug: string) {
  const file = path.join(process.cwd(), "content/projects", `${slug}.mdx`);
  const source = await fs.readFile(file, "utf8");
  const { content } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: true },
  });
  return content;
}

export type CaseStudySection = { id: string; title: string };

/** The case study's H2 outline — drives the sticky section nav. Ids match
 * the h2 anchors the compiler renders (slugifyHeading). */
export async function getProjectSections(
  slug: string,
): Promise<CaseStudySection[]> {
  const file = path.join(process.cwd(), "content/projects", `${slug}.mdx`);
  const source = await fs.readFile(file, "utf8");
  const sections: CaseStudySection[] = [];
  for (const match of source.matchAll(/^##\s+(.+)$/gm)) {
    const title = match[1].trim();
    sections.push({ id: slugifyHeading(title), title });
  }
  return sections;
}

export function projectSlugs() {
  return projects.map((project) => project.slug);
}
