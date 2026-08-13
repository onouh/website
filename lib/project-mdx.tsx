import fs from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { MDXComponents } from "mdx/types";
import { projects } from "@/content/projects";

const components: MDXComponents = {
  h2: (props) => (
    <h2
      className="mt-10 mb-3 font-[family-name:var(--font-syne)] text-xl font-bold tracking-tight text-[var(--text)] first:mt-0"
      {...props}
    />
  ),
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

export function projectSlugs() {
  return projects.map((project) => project.slug);
}
