import "./Bunting.css";

const FLAG_COUNT = 16;
const COLORS = ["var(--fg)", "var(--fg-dim)", "var(--accent)"];

// Evenly spaced flags hanging from a gently sagging string, in a
// 1000×20 grid (the SVG stretches to the navbar's actual width via
// preserveAspectRatio="none"). The string sits right at y=0 — which,
// via the CSS below, lines up exactly with the header's bottom edge,
// the same line the navbar flower's petals land on.
const STRING_Y = 0;
const SAG = 5;

function stringYAt(x) {
  // Same quadratic the <path> below draws, sampled per flag so each
  // one hangs exactly off the curve instead of a straight line.
  const t = x / 1000;
  return STRING_Y + 4 * SAG * t * (1 - t);
}

const FLAGS = Array.from({ length: FLAG_COUNT }, (_, i) => {
  const x = 30 + (i * (940 / (FLAG_COUNT - 1)));
  return { x, y: stringYAt(x), color: COLORS[i % COLORS.length] };
});

/**
 * A small pennant-flag garland strung across the top of the header, in
 * the site's own palette rather than a rainbow — each flag sways on its
 * own gentle rhythm, like a real one catching a breeze.
 */
export default function Bunting() {
  return (
    <svg
      className="bunting"
      viewBox="0 0 1000 20"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={`M0 ${STRING_Y} Q 500 ${STRING_Y + SAG} 1000 ${STRING_Y}`}
        fill="none"
        stroke="var(--fg-dim)"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />

      {FLAGS.map((f, i) => (
        <g
          key={i}
          className="bunting-flag"
          style={{
            transformOrigin: `${f.x}px ${f.y}px`,
            animationDelay: `${i * 0.11}s`,
          }}
        >
          <path
            d={`M${f.x - 6} ${f.y} L${f.x + 6} ${f.y} L${f.x} ${f.y + 10} Z`}
            fill={f.color}
          />
        </g>
      ))}
    </svg>
  );
}
