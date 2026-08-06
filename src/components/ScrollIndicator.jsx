import "./ScrollIndicator.css";

import { useRef } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollIndicator() {

  const root = useRef(null);

  const path = useRef(null);
  const dot = useRef(null);
  const text = useRef(null);

  useGSAP(() => {

    const svgPath = path.current;
    const svgDot = dot.current;
    const svgText = text.current;
    const el = root.current;

    // Anchor the indicator exactly where it used to sit in the document
    // flow, right under the hero buttons, then keep it pinned there on
    // screen (position: fixed) so it never scrolls away.
    const placeAnchor = () => {
      const buttons = document.querySelector(".hero-buttons");
      if (!buttons) return;
      const rect = buttons.getBoundingClientRect();
      el.style.left = `${rect.left}px`;
      el.style.top = `${window.scrollY + rect.bottom + 28}px`;
    };

    placeAnchor();
    window.addEventListener("resize", placeAnchor);

    const totalLength = svgPath.getTotalLength();

    gsap.set(svgPath, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength,
    });

    gsap.set(svgText, {
      opacity: 0,
      x: -20,
    });

    gsap.set(el, { opacity: 1 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        endTrigger: "#story",
        end: "bottom bottom",
        scrub: true,
        onRefresh: placeAnchor,
      },
    });

    // Fades out only in the final stretch, right as the story section ends.
    tl.to(el, {
      opacity: 0,
      ease: "none",
      duration: 0.04,
    }, 0.96);

    tl.to(svgPath, {
      strokeDashoffset: 0,
      ease: "none",
      duration: 1,
      onUpdate: function () {
        const progress = this.progress();
        const currentLength = totalLength * progress;
        const point = svgPath.getPointAtLength(currentLength);

        gsap.set(svgDot, {
          attr: {
            cx: point.x,
            cy: point.y,
            r: progress > 0.9 ? 6.5 : 5,
          },
        });
      },
    }, 0);

    tl.to(svgText, {
      opacity: 1,
      x: 0,
      ease: "none",
      duration: 0.15,
    }, 0.85);

    return () => window.removeEventListener("resize", placeAnchor);

  }, { scope: root });

  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (

    <button
      ref={root}
      className="indicator"
      onClick={scrollToStory}
    >

      <svg
        width="200"
        height="220"
        viewBox="0 0 200 220"
      >

        <path
          ref={path}
          className="indicator-path"
          d="
            M40 0
            L40 90
            Q40 120 70 120
            L70 210
          "
          fill="none"
        />

        <circle
          ref={dot}
          className="indicator-dot"
          cx="40"
          cy="0"
          r="5"
        />

        <text
          ref={text}
          className="indicator-text"
          x="84"
          y="214"
        >
          Моя история
        </text>

      </svg>

    </button>

  );

}
