"use client";

/**
 * Root-level error boundary — the last line of defense when the root
 * layout itself fails. Must render its own <html>/<body> shell since the
 * real one is not mounted. Deliberately minimal: no fonts, no nav.
 */

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#05070c",
          color: "#f7f8fa",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <p
          style={{
            color: "#e8a33d",
            fontSize: 13,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          Something broke
        </p>
        <h1 style={{ fontSize: 32, margin: 0 }}>Unexpected error</h1>
        <p style={{ color: "#8b96ab", maxWidth: 420 }}>
          The site hit a problem while starting up. Try again — or come back
          later.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "1px solid #e8a33d",
            background: "transparent",
            color: "#e8a33d",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        {error.digest ? (
          <p style={{ color: "#5b6472", fontSize: 12 }}>digest: {error.digest}</p>
        ) : null}
      </body>
    </html>
  );
}
