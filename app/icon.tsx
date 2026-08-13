import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0C0E12",
          color: "#F0A500",
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        ON
      </div>
    ),
    { ...size },
  );
}
