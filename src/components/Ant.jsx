import "./Ant.css";

/**
 * A tiny decorative ant that wanders back and forth along the edge of
 * whichever section it's dropped into — a bit of life in the empty
 * hairline borders between sections. Its legs walk in an alternating
 * tripod gait (front-left/mid-right/back-left swing together, then the
 * other three) instead of just sliding as a flat picture.
 */
export default function Ant({ edge = "top", duration = "24s", delay = "0s", size = 18 }) {
  return (
    <svg
      className={`ant-walker ant-${edge}`}
      style={{
        width: size,
        "--ant-duration": duration,
        "--ant-delay": delay,
      }}
      viewBox="0 0 40 22"
      aria-hidden="true"
    >
      <g className="ant-body-bob">
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
          <g className="ant-leg ant-leg-a" style={{ transformOrigin: "14px 10px" }}>
            <path d="M14 10 L6 5" />
          </g>
          <g className="ant-leg ant-leg-b" style={{ transformOrigin: "14px 12px" }}>
            <path d="M14 12 L4 12" />
          </g>
          <g className="ant-leg ant-leg-a" style={{ transformOrigin: "14px 14px" }}>
            <path d="M14 14 L6 19" />
          </g>
          <g className="ant-leg ant-leg-b" style={{ transformOrigin: "24px 10px" }}>
            <path d="M24 10 L32 5" />
          </g>
          <g className="ant-leg ant-leg-a" style={{ transformOrigin: "24px 12px" }}>
            <path d="M24 12 L34 12" />
          </g>
          <g className="ant-leg ant-leg-b" style={{ transformOrigin: "24px 14px" }}>
            <path d="M24 14 L32 19" />
          </g>
        </g>

        <g fill="currentColor">
          <circle cx="10" cy="11" r="3.4" />
          <circle cx="19" cy="12" r="4" />
          <circle cx="29" cy="12.5" r="4.6" />
        </g>

        <path
          d="M9 8 L5 3 M11 8 L9 2.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
