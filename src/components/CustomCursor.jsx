import { useEffect, useRef, useState } from "react";
import "./CustomCursor.css";

const FINE_POINTER =
  typeof window !== "undefined" && window.matchMedia?.("(pointer: fine)").matches;

/**
 * A thin ring that replaces the system cursor on mouse-driven devices —
 * mix-blend-mode keeps it visible on both the black background and the
 * light photo, and it fills solid over anything clickable. Left alone
 * on touch devices (no fine pointer, nothing to replace).
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const [active, setActive] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (!FINE_POINTER) return;

    const move = (e) => {
      setHidden(false);
      const el = dotRef.current;
      if (el) el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const over = e.target.closest("a, button, input, [role='button'], .btn-burst");
      setActive(Boolean(over));
    };
    const leave = () => setHidden(true);

    window.addEventListener("mousemove", move);
    document.documentElement.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
    };
  }, []);

  if (!FINE_POINTER) return null;

  return (
    <div
      ref={dotRef}
      className={`cursor-dot${active ? " is-active" : ""}${hidden ? " is-hidden" : ""}`}
      aria-hidden="true"
    />
  );
}
