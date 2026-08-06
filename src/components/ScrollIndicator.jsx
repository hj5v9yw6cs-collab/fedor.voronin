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

    const totalLength = svgPath.getTotalLength();

    gsap.set(svgPath, {
      strokeDasharray: totalLength,
      strokeDashoffset: totalLength,
    });

    gsap.set(svgText, {
      opacity: 0,
      x: -20,
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom center",
        scrub: true,
      },
    });

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
            r: progress > 0.55 && progress < 0.75 ? 6.5 : 5,
          },
        });
      },
    }, 0);

    tl.to(svgText, {
      opacity: 1,
      x: 0,
      ease: "none",
      duration: 0.25,
    }, 0.75);

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
        width="260"
        height="240"
        viewBox="0 0 260 240"
      >

        <path
          ref={path}
          className="indicator-path"
          d="
            M120 10
            L120 150
            C120 182 144 205 172 205
          "
          fill="none"
        />

        <circle
          ref={dot}
          className="indicator-dot"
          cx="120"
          cy="10"
          r="5"
        />

        <text
          ref={text}
          className="indicator-text"
          x="185"
          y="210"
        >
          Моя история
        </text>

      </svg>

    </button>

  );

}