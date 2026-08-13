import { ImageResponse } from "next/og";
import { profile } from "@/content/profile";

export const alt = `${profile.name} — ${profile.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
        <div style={{ color: "#2f6bff", fontSize: 28, letterSpacing: 4 }}>
          {profile.title.toUpperCase()}
        </div>
        <div style={{ fontSize: 72, fontWeight: 800, marginTop: 16 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 28, color: "#8b96ab", marginTop: 20, maxWidth: 900 }}>
          {profile.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
