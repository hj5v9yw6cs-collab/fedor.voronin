import { useEffect, useRef, useState } from "react";
import "./Flower.css";

// The 8 petals sit 45° apart. These are their attach points as a percent
// of the flower's own box (derived from the SVG geometry: petals are
// ellipses centered 24 units from a (50,50) origin in a 100x100 viewBox,
// rotated by each angle) — used both to draw the mark and as the spot a
// shed petal starts falling from.
const PETALS = [
  { angle: 0, x: 50, y: 26 },
  { angle: 45, x: 67, y: 33 },
  { angle: 90, x: 74, y: 50 },
  { angle: 135, x: 67, y: 67 },
  { angle: 180, x: 50, y: 74 },
  { angle: 225, x: 33, y: 67 },
  { angle: 270, x: 26, y: 50 },
  { angle: 315, x: 33, y: 33 },
];

// Hand-picked scatter so the 8 shed petals don't land in one identical
// spot — a bit of sideways drift and a resting tilt each.
const LANDING = [
  { dx: -22, rot: -35 },
  { dx: 14, rot: 22 },
  { dx: -8, rot: 55 },
  { dx: 26, rot: -18 },
  { dx: -32, rot: 12 },
  { dx: 6, rot: -48 },
  { dx: 34, rot: 32 },
  { dx: -14, rot: -22 },
];

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * The site's brand mark — a daisy. It starts whole; once it scrolls
 * into view, its petals tear off one at a time (the mark itself has
 * fewer and fewer petals) and drop straight down onto whatever sits
 * below it, coming to rest there for good — they don't fade or loop,
 * they just stay fallen. Once every petal is gone, only the center
 * (and its little stem) is left.
 */
export default function Flower({ size = 96, fallDistance = 90, className = "" }) {
  const [shed, setShed] = useState(0);
  const rootRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || startedRef.current) return;

    const shedAll = () => {
      startedRef.current = true;
      const step = REDUCED_MOTION ? 0 : 550;
      PETALS.forEach((_, i) => {
        setTimeout(() => setShed((n) => Math.max(n, i + 1)), i * step + 250);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          shedAll();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const petalW = Math.round(size * 0.13);
  const petalH = Math.round(size * 0.3);

  return (
    <div
      ref={rootRef}
      className={`flower ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      <svg className="flower-mark" viewBox="0 0 100 100" width={size} height={size}>
        <g fill="currentColor">
          {PETALS.map((p, i) =>
            i >= shed ? (
              <ellipse
                key={p.angle}
                cx="50"
                cy="26"
                rx="9"
                ry="21"
                transform={`rotate(${p.angle} 50 50)`}
              />
            ) : null
          )}
        </g>
        <circle cx="50" cy="50" r="13" fill="var(--accent)" />
        <rect x="47" y="80" width="6" height="18" rx="3" fill="currentColor" />
      </svg>

      <div className="flower-fallen">
        {PETALS.slice(0, shed).map((p, i) => {
          const land = LANDING[i % LANDING.length];
          return (
            <span
              key={p.angle}
              className="flower-petal-fallen"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: petalW,
                height: petalH,
                "--land-x": `${land.dx}px`,
                "--land-y": `${fallDistance}px`,
                "--land-rot": `${land.rot}deg`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
