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
        width="100%"
        height="100%"
        viewBox="0 0 150 720"
        preserveAspectRatio="none"
      >

        <path
          ref={path}
          className="indicator-path"
          d="
            M40 0
            L40 300
            Q40 340 80 340
            L80 680
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
          x="94"
          y="684"
        >
          Моя история
        </text>

      </svg>

    </button>

  );

}
