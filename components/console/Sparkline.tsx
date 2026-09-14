type SparklineProps = {
  points: number[];
  width?: number;
  height?: number;
  positive?: boolean;
  ariaLabel: string;
};

// Rendered as a row of ticks, not a line chart — same visual language as
// TicketPunch (order progress), so a trend reads as a punch tape rather
// than a fintech-dashboard sparkline.
export function Sparkline({ points, width = 160, height = 44, ariaLabel }: SparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;

  const gap = 2;
  const barWidth = (width - gap * (points.length - 1)) / points.length;
  const minHeight = 3;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      {points.map((p, i) => {
        const barHeight = Math.max(minHeight, ((p - min) / range) * (height - minHeight));
        const x = i * (barWidth + gap);
        const y = height - barHeight;
        const isLast = i === points.length - 1;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={isLast ? "var(--color-brand-gold)" : "var(--color-brand-navy)"}
            opacity={isLast ? 1 : 0.18 + (i / points.length) * 0.35}
            style={{
              transformOrigin: `${x + barWidth / 2}px ${height}px`,
              animation: `bar-rise 400ms ease-out ${i * 25}ms backwards`,
            }}
          />
        );
      })}
    </svg>
  );
}
