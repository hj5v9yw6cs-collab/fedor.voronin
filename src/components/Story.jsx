import "./Story.css";
import Ant from "./Ant";
import { useTypedBlocks } from "../lib/useTypedBlocks";
import { useLanguage } from "../lib/i18nData";

export default function Story() {
  const { strings } = useLanguage();
  const { output, rootRef, activeIndex } = useTypedBlocks(strings.story.blocks);

  const cursor = (i) =>
    activeIndex === i ? <span className="story-cursor" /> : null;

  return (
    <section id="story" className="story" ref={rootRef}>

      <Ant edge="top" duration="30s" delay="4s" />

      <div className="story-container">

        <div className="story-content">

          <span className="story-label">
            {strings.story.label}
          </span>

          <h2>
            {output[0]}
            {cursor(0)}
          </h2>

          <p>
            {output[1]}
            {cursor(1)}
          </p>

          <p>
            {output[2]}
            {cursor(2)}
          </p>

          <p className="story-big">
            {output[3]}
            {cursor(3)}
          </p>

        </div>

      </div>

    </section>
  );
}
