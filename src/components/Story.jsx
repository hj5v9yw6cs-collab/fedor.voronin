import "./Story.css";
import Ant from "./Ant";
import { useTypedBlocks } from "../lib/useTypedBlocks";

const BLOCKS = [
  "Всё началось\nс желания\nпознакомиться.",
  "Мне было около пяти лет. Мы с мамой были в путешествии. На площади играли дети, и мне очень хотелось подойти к ним.",
  "Но оказалось, что мы говорим на разных языках.",
  "Тогда я впервые понял, что язык — это возможность знакомиться с людьми.",
];

export default function Story() {
  const { output, rootRef, activeIndex } = useTypedBlocks(BLOCKS);

  const cursor = (i) =>
    activeIndex === i ? <span className="story-cursor" /> : null;

  return (
    <section id="story" className="story" ref={rootRef}>

      <Ant edge="top" duration="30s" delay="4s" />

      <div className="story-container">

        <div className="story-content">

          <span className="story-label">
            МОЯ ИСТОРИЯ
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
