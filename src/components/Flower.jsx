import "./Flower.css";

const PETALS = [
  { left: "36%", x: "-24px", delay: "0s", duration: "3.3s", size: 1, spin: "140deg" },
  { left: "48%", x: "12px", delay: "0.7s", duration: "3.8s", size: 0.8, spin: "-160deg" },
  { left: "58%", x: "-6px", delay: "1.5s", duration: "3.1s", size: 1.1, spin: "200deg" },
  { left: "44%", x: "28px", delay: "2.1s", duration: "3.6s", size: 0.85, spin: "-120deg" },
  { left: "64%", x: "16px", delay: "2.7s", duration: "3.4s", size: 0.95, spin: "180deg" },
  { left: "32%", x: "8px", delay: "1s", duration: "4s", size: 0.9, spin: "-200deg" },
];

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/**
 * The site's brand mark — a daisy ("ромашка"), replacing the earlier
 * clover. `withPetals` turns on the looping petals that drift out of it
 * and fall, in the spirit of masamadre.ru's animated mark.
 */
export default function Flower({ size = 96, withPetals = false, className = "" }) {
  return (
    <div
      className={`flower ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg
        className="flower-mark"
        viewBox="0 0 100 100"
        width={size}
        height={size}
      >
        <g fill="currentColor">
          {PETAL_ANGLES.map((angle) => (
            <ellipse
              key={angle}
              cx="50"
              cy="26"
              rx="9"
              ry="21"
              transform={`rotate(${angle} 50 50)`}
            />
          ))}
        </g>
        <circle cx="50" cy="50" r="13" fill="var(--accent)" />
        <rect x="47" y="80" width="6" height="18" rx="3" fill="currentColor" />
      </svg>

      {withPetals && (
        <div className="flower-petals">
          {PETALS.map((petal, i) => (
            <span
              key={i}
              className="flower-petal"
              style={{
                left: petal.left,
                "--petal-x": petal.x,
                "--petal-delay": petal.delay,
                "--petal-duration": petal.duration,
                "--petal-size": petal.size,
                "--petal-spin": petal.spin,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
