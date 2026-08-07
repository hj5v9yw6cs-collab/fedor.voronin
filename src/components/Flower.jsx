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

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const GRAVITY = 2600; // px/s²

function makePetalEl(layer, attach, size) {
  const petalW = size * 0.13; // short axis — its thickness once lying flat
  const petalH = size * 0.3; // long axis — its footprint once lying flat
  const el = document.createElement("span");
  el.className = "flower-petal-fallen";
  el.style.left = `${attach.x}%`;
  el.style.top = `${attach.y}%`;
  el.style.width = `${Math.round(petalW)}px`;
  el.style.height = `${Math.round(petalH)}px`;
  layer.appendChild(el);
  return el;
}

/**
 * A windy petal isn't landing anywhere — it gets caught and carried
 * off to the right until it's blown straight past the edge of the
 * screen and gone, the way a real light petal would just disappear
 * down the street rather than politely resting nearby.
 */
function blowPetal({ layer, container, attach, size, wind }) {
  const flowerRect = container.getBoundingClientRect();
  const startX = (attach.x / 100) * flowerRect.width;
  const el = makePetalEl(layer, attach, size);

  if (REDUCED_MOTION) {
    el.remove();
    return;
  }

  let x = 0;
  let y = 0;
  let rot = 0;
  let vx = wind * (0.5 + Math.random() * 0.3);
  let vy = (Math.random() - 0.5) * 12;
  let last = performance.now();
  const offRight = window.innerWidth - (flowerRect.left + startX) + 60;

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.032);
    last = now;

    vy += GRAVITY * 0.025 * dt; // barely any sag — this is a near-flat gust, not a fall
    y += vy * dt;
    vx += wind * dt;
    x += vx * dt;
    rot += vx * dt * 2.2;

    if (x > offRight) {
      el.remove();
      return;
    }

    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg)`;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/**
 * Drops one shed petal with actual gravity — accelerates downward,
 * drifts a little sideways, tumbles as it falls — until it reaches the
 * flower's real, measured floor (floorSelector/floorEdge), where it
 * settles for good. Petals are light and flat: they don't stack or
 * balance on top of one another (nothing here holds another petal up),
 * they all come to rest on the same actual surface, just with a small
 * random landing height so a few of them visibly overlap at a natural
 * angle instead of lining up in a perfectly flat row.
 */
function dropPetal({ layer, container, attach, size, floorSelector, floorEdge, floorPadding }) {
  const flowerRect = container.getBoundingClientRect();
  const startY = (attach.y / 100) * flowerRect.height;

  const floorEl = floorSelector ? document.querySelector(floorSelector) : null;
  const floorY = floorEl
    ? (floorEdge === "bottom"
        ? floorEl.getBoundingClientRect().bottom
        : floorEl.getBoundingClientRect().top) - floorPadding
    : flowerRect.top + startY + 90;

  const petalW = size * 0.13;

  // Ground floor, relative to this petal's own start point, with a
  // small random settle so petals landing near each other don't all
  // sit at the exact same height (a thin petal resting half-over
  // another only raises by a few px, not by a whole petal's height).
  const floor = Math.max(14, floorY - flowerRect.top) - startY + Math.random() * petalW * 0.7;

  const el = makePetalEl(layer, attach, size);
  const settleRot = (Math.random() < 0.5 ? 1 : -1) * (80 + Math.random() * 20);

  if (REDUCED_MOTION) {
    el.style.transform = `translate(-50%, -50%) translate(0, ${floor}px) rotate(${settleRot}deg)`;
    return;
  }

  let x = 0;
  let y = 0;
  let vx = (Math.random() - 0.5) * 90;
  let vy = -30 - Math.random() * 50;
  let rot = 0;
  let last = performance.now();

  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.032);
    last = now;

    vy += GRAVITY * dt;
    y += vy * dt;
    x += vx * dt;
    vx *= Math.max(0, 1 - 3 * dt);
    rot += vx * dt * 3.5;

    if (y >= floor) {
      el.style.transition = "transform .16s ease-out";
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${floor}px) rotate(${settleRot}deg)`;
      return;
    }

    el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg)`;
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/**
 * The site's brand mark — a daisy. It starts whole; once it scrolls
 * into view, its petals tear off one at a time (the mark itself has
 * fewer and fewer petals). Normally each one falls — real gravity —
 * onto a specific surface below it and stays there. Pass `wind`
 * instead of `floorSelector` and a petal doesn't land at all: it gets
 * carried off to the right and blown straight past the edge of the
 * screen. Once every petal is gone, only the center (and its little
 * stem) is left.
 *
 * `floorSelector` is a CSS selector for the element whose edge acts as
 * the ground; `floorEdge` picks which edge ("top" or "bottom"). Pass
 * `static` to keep the flower whole and skip the shedding entirely.
 */
export default function Flower({
  size = 96,
  floorSelector,
  floorEdge = "top",
  floorPadding = 0,
  wind = 0,
  static: isStatic = false,
  className = "",
}) {
  const [shed, setShed] = useState(0);
  const rootRef = useRef(null);
  const layerRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (isStatic) return;
    const el = rootRef.current;
    if (!el || startedRef.current) return;

    const shedAll = () => {
      startedRef.current = true;
      const step = REDUCED_MOTION ? 0 : 950;
      PETALS.forEach((p, i) => {
        setTimeout(() => {
          setShed((n) => Math.max(n, i + 1));
          if (!rootRef.current || !layerRef.current) return;

          if (wind !== 0) {
            blowPetal({ layer: layerRef.current, container: rootRef.current, attach: p, size, wind });
          } else {
            dropPetal({
              layer: layerRef.current,
              container: rootRef.current,
              attach: p,
              size,
              floorSelector,
              floorEdge,
              floorPadding,
            });
          }
        }, i * step + 250);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {!isStatic && <div ref={layerRef} className="flower-fallen" />}
    </div>
  );
}
