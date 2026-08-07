import { useEffect, useRef } from "react";
import "./ButtonBurst.css";

const LINE_COUNT = 6;

/**
 * Mounted once near the app root. Listens for clicks on anything
 * carrying the `btn-burst` class and fires a small, minimal burst of
 * thin lines outward from the exact click point — not the button's
 * center — like a puff of wind under the cursor. Uses plain DOM nodes
 * instead of React state since these are pure fire-and-forget visuals
 * with nothing to keep in sync.
 */
export default function ButtonBurst() {
  const layerRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      const target = e.target.closest(".btn-burst");
      if (!target) return;

      const layer = layerRef.current;
      if (!layer) return;

      const group = document.createElement("span");
      group.className = "burst-group";
      group.style.left = `${e.clientX}px`;
      group.style.top = `${e.clientY}px`;

      for (let i = 0; i < LINE_COUNT; i++) {
        const line = document.createElement("span");
        line.className = "burst-line";
        const angle = (360 / LINE_COUNT) * i + (Math.random() * 10 - 5);
        line.style.setProperty("--burst-angle", `${angle}deg`);
        line.style.setProperty("--burst-dist", `${16 + Math.random() * 10}px`);
        group.appendChild(line);
      }

      layer.appendChild(group);
      setTimeout(() => group.remove(), 450);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <div ref={layerRef} className="burst-layer" aria-hidden="true" />;
}
