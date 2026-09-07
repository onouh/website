import { ImageResponse } from "next/og";
import { projects } from "@/content/projects";

/** Dynamic OG card per case study: project name, language, summary. */
export const alt = "Project case study";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export default async function OpenGraphImage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  const name = project?.name ?? "Project";
  const lang = project?.lang ?? "";
  const summary = project?.summary ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#05070c",
          color: "#f7f8fa",
        }}
      >
        <div style={{ color: "#e8a33d", fontSize: 26, letterSpacing: 4 }}>
          {lang.toUpperCase()}
        </div>
        <div style={{ fontSize: 68, fontWeight: 800, marginTop: 16 }}>{name}</div>
        <div style={{ fontSize: 26, color: "#8b96ab", marginTop: 20, maxWidth: 920 }}>
          {summary.length > 160 ? `${summary.slice(0, 157)}…` : summary}
        </div>
      </div>
    ),
    { ...size },
  );
}
