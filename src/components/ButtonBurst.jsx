import { useEffect, useRef } from "react";
import "./ButtonBurst.css";

const LINE_COUNT = 10;

/**
 * Mounted once near the app root. Listens for clicks on anything
 * carrying the `btn-burst` class and fires a little burst of thin
 * lines radiating outward from it — a puff of "wind" on click. Uses
 * plain DOM nodes instead of React state since these are pure
 * fire-and-forget visuals with nothing to keep in sync.
 */
export default function ButtonBurst() {
  const layerRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      const target = e.target.closest(".btn-burst");
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const layer = layerRef.current;
      if (!layer) return;

      const group = document.createElement("span");
      group.className = "burst-group";
      group.style.left = `${cx}px`;
      group.style.top = `${cy}px`;

      for (let i = 0; i < LINE_COUNT; i++) {
        const line = document.createElement("span");
        line.className = "burst-line";
        const angle = (360 / LINE_COUNT) * i + (Math.random() * 14 - 7);
        line.style.setProperty("--burst-angle", `${angle}deg`);
        line.style.setProperty("--burst-dist", `${32 + Math.random() * 20}px`);
        group.appendChild(line);
      }

      layer.appendChild(group);
      setTimeout(() => group.remove(), 650);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <div ref={layerRef} className="burst-layer" aria-hidden="true" />;
}
