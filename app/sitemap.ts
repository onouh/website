import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { getSiteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const paths = [
    "",
    "/about",
    "/experience",
    "/education",
    "/skills",
    "/projects",
    "/resume",
    "/contact",
    ...projects.map((project) => `/projects/${project.slug}`),
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
