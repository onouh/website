const BARS = 8;
const GAP_RATIO = 0.42;

export function IbmWordmark({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const label = name.toUpperCase();

  return (
    <svg
      className={`ibm-wordmark ${className}`.trim()}
      viewBox="0 0 380 52"
      role="img"
      aria-labelledby="ibm-wordmark-title"
    >
      <title id="ibm-wordmark-title">{name}</title>
      <defs>
        <mask id="ibm-wordmark-bars" maskUnits="userSpaceOnUse">
          {Array.from({ length: BARS }, (_, i) => {
            const band = 52 / BARS;
            const gap = band * GAP_RATIO;
            return (
              <rect
                key={i}
                x="0"
                y={i * band}
                width="380"
                height={band - gap}
                fill="#fff"
              />
            );
          })}
        </mask>
      </defs>
      <text
        x="0"
        y="44"
        mask="url(#ibm-wordmark-bars)"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.4"
        paintOrder="stroke fill"
        fontFamily="var(--font-ibm-plex-serif), 'IBM Plex Serif', serif"
        fontWeight="700"
        fontSize="48"
        letterSpacing="4"
      >
        {label}
      </text>
    </svg>
  );
}
