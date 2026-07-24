// The single visual idea this app is built around: a compatibility score is
// the ONE number every user cares about most, so instead of a generic badge
// or progress bar, it gets its own consistent ring shape everywhere it
// appears - landing page hero, match cards, match detail. Repetition of one
// distinctive shape is what makes it feel designed rather than templated.
export default function CompatibilityRing({ score, size = 96, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${score} percent compatibility`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span
        className="absolute font-mono font-semibold text-ink"
        style={{ fontSize: size * 0.22 }}
      >
        {score}%
      </span>
    </div>
  );
}
