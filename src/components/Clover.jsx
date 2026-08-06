import "./Clover.css";

const SEEDS = [
  { left: "38%", x: "-22px", delay: "0s", duration: "3.1s", size: 1 },
  { left: "48%", x: "10px", delay: "0.6s", duration: "3.6s", size: 0.85 },
  { left: "56%", x: "-8px", delay: "1.3s", duration: "3s", size: 1.05 },
  { left: "44%", x: "26px", delay: "2s", duration: "3.4s", size: 0.9 },
  { left: "62%", x: "18px", delay: "2.6s", duration: "3.2s", size: 0.8 },
  { left: "33%", x: "6px", delay: "0.9s", duration: "3.8s", size: 0.95 },
];

/**
 * The site's brand mark — a clover-shaped blob echoing masamadre.ru's
 * logo. `withSeeds` turns on the looping "grain" particles that drift
 * out of it and fall, matching the animation on the reference site.
 */
export default function Clover({ size = 96, withSeeds = false, className = "" }) {
  return (
    <div
      className={`clover ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        className="clover-mark"
        viewBox="0 0 100 100"
        width={size}
        height={size}
      >
        <g fill="currentColor">
          <ellipse cx="35" cy="30" rx="19" ry="22" transform="rotate(-12 35 30)" />
          <ellipse cx="61" cy="28" rx="17" ry="20" transform="rotate(10 61 28)" />
          <ellipse cx="52" cy="56" rx="15" ry="17" transform="rotate(25 52 56)" />
          <rect x="46" y="62" width="6" height="24" rx="3" />
        </g>
        <g
          className="clover-veins"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="2.4"
          strokeLinecap="round"
        >
          <path d="M27 18 Q34 29 30 41" />
          <path d="M56 16 Q62 27 59 39" />
          <path d="M46 47 Q53 56 49 66" />
        </g>
      </svg>

      {withSeeds && (
        <div className="clover-seeds">
          {SEEDS.map((seed, i) => (
            <span
              key={i}
              className="clover-seed"
              style={{
                left: seed.left,
                "--seed-x": seed.x,
                "--seed-delay": seed.delay,
                "--seed-duration": seed.duration,
                "--seed-size": seed.size,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
