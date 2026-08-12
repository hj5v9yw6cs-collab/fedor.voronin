import { useEffect, useRef, useState } from "react";

/**
 * Types out a sequence of text blocks one at a time, character by
 * character, starting once the given ref scrolls into view. The pace
 * isn't constant — it pauses a bit longer after punctuation, and
 * occasionally stalls for a moment mid-word, like someone actually
 * composing the thought rather than a flat-speed typewriter.
 *
 * If `blocks` itself changes later (e.g. the site's language switches)
 * after it's already been shown once, it retypes from scratch with the
 * new text instead of just swapping it in instantly.
 */
export function useTypedBlocks(blocks) {
  const [output, setOutput] = useState(() => blocks.map(() => ""));
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const visibleRef = useRef(false);
  const prevBlocksRef = useRef(blocks);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !visibleRef.current) {
          visibleRef.current = true;
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
    if (blocks === prevBlocksRef.current) return;
    prevBlocksRef.current = blocks;
    if (!visibleRef.current) return;
    setOutput(blocks.map(() => ""));
    setActiveIndex(0);
  }, [blocks]);

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
        }, 100);
        return;
      }

      const justTyped = text[i - 1];
      let delay = 1 + Math.random() * 3;
      if (".,!?—…".includes(justTyped)) delay += 35 + Math.random() * 55;
      if (Math.random() < 0.012) delay += 70 + Math.random() * 130; // a beat to think

      timer = setTimeout(tick, delay);
    };

    timer = setTimeout(tick, 50);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeIndex, blocks]);

  return { output, rootRef, activeIndex, done: activeIndex >= blocks.length };
}
