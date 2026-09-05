export function IbmWordmark({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span className={`ibm-wordmark ${className}`.trim()}>{name}</span>
  );
}
