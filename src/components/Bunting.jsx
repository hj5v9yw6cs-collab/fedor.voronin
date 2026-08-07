import "./Bunting.css";

const FLAG_COUNT = 13; // 3 swags, tied every 4 flags: 0-4, 4-8, 8-12
const SWAG_SIZE = 4;
const COLORS = ["var(--fg)", "var(--fg-dim)", "var(--accent)"];

// The rope is tied down every 5th flag (indices 0, 4, 8, 12) and sags
// in one wide half-oval arc between each pair of ties — like real
// bunting, not a tiny scallop between every single flag. Everything
// else (including the flags in between) hangs off whatever height the
// rope actually is at that point, because that's what it's tied to.
const TIE_Y = 0;
const SWAG_SAG = 9; // how deep each swag's arc dips at its middle
const FLAG_HALF_W = 6;
const FLAG_H = 9;

const FLAG_X = Array.from(
  { length: FLAG_COUNT },
  (_, i) => 30 + i * (940 / (FLAG_COUNT - 1))
);

const TIE_INDICES = [];
for (let i = 0; i < FLAG_COUNT - 1; i += SWAG_SIZE) TIE_INDICES.push(i);
if (TIE_INDICES[TIE_INDICES.length - 1] !== FLAG_COUNT - 1) {
  TIE_INDICES.push(FLAG_COUNT - 1);
}

function ropeYAt(x) {
  for (let k = 0; k < TIE_INDICES.length - 1; k++) {
    const x0 = FLAG_X[TIE_INDICES[k]];
    const x1 = FLAG_X[TIE_INDICES[k + 1]];
    if (x <= x1 || k === TIE_INDICES.length - 2) {
      const t = (x - x0) / (x1 - x0);
      return TIE_Y + 4 * SWAG_SAG * t * (1 - t);
    }
  }
  return TIE_Y;
}

const FLAGS = FLAG_X.map((x, i) => ({
  x,
  y: ropeYAt(x),
  color: COLORS[i % COLORS.length],
}));

const STRING_PATH = TIE_INDICES.reduce((d, tieIdx, k) => {
  const x = FLAG_X[tieIdx];
  if (k === 0) return `M${x} ${TIE_Y}`;
  const prevX = FLAG_X[TIE_INDICES[k - 1]];
  const midX = (prevX + x) / 2;
  return `${d} Q${midX} ${TIE_Y + 2 * SWAG_SAG} ${x} ${TIE_Y}`;
}, "");

/**
 * A small pennant-flag garland strung along the header's bottom edge —
 * the same line the navbar flower's petals land on — in the site's own
 * palette. Static: it doesn't sway, it just hangs, tied down every
 * 5th flag with the rope sagging in wide half-oval arcs in between,
 * and every flag (including the ones mid-arc) follows the rope's
 * actual height at its own spot rather than sitting on one flat line.
 */
export default function Bunting() {
  return (
    <svg
      className="bunting"
      viewBox="0 0 1000 26"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={STRING_PATH}
        fill="none"
        stroke="var(--fg)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {FLAGS.map((f) => (
        <path
          key={f.x}
          d={`M${f.x - FLAG_HALF_W} ${f.y} A${FLAG_HALF_W} ${FLAG_H} 0 0 0 ${f.x + FLAG_HALF_W} ${f.y} Z`}
          fill={f.color}
        />
      ))}
    </svg>
  );
}
