import { useEffect, useRef, useState } from "react";

/**
 * Types out a sequence of text blocks one at a time, character by
 * character, starting once the given ref scrolls into view. The pace
 * isn't constant — it pauses a bit longer after punctuation, and
 * occasionally stalls for a moment mid-word, like someone actually
 * composing the thought rather than a flat-speed typewriter.
 */
export function useTypedBlocks(blocks) {
  const [output, setOutput] = useState(() => blocks.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || startedRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startedRef.current = true;
          observer.disconnect();
          setActiveIndex(0);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeIndex < 0 || activeIndex >= blocks.length) return;

    const text = blocks[activeIndex];
    let i = 0;
    let cancelled = false;
    let timer;

    const tick = () => {
      if (cancelled) return;
      i += 1;
      setOutput((prev) => {
        const next = prev.slice();
        next[activeIndex] = text.slice(0, i);
        return next;
      });

      if (i >= text.length) {
        timer = setTimeout(() => {
          if (!cancelled) setActiveIndex((idx) => idx + 1);
        }, 180);
        return;
      }

      const justTyped = text[i - 1];
      let delay = 3 + Math.random() * 7;
      if (".,!?—…".includes(justTyped)) delay += 70 + Math.random() * 110;
      if (Math.random() < 0.012) delay += 140 + Math.random() * 260; // a beat to think

      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 80);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeIndex, blocks]);

  return { output, rootRef, activeIndex, done: activeIndex >= blocks.length };
}
