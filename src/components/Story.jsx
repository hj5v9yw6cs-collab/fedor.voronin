import "./Story.css";
import Ant from "./Ant";

export default function Story() {
  return (
    <section id="story" className="story">

      <Ant edge="top" duration="30s" delay="4s" />

      <div className="story-container">

        <div className="story-content">

          <span className="story-label">
            МОЯ ИСТОРИЯ
          </span>

          <h2>
            Всё началось
            <br />
            с желания
            <br />
            познакомиться.
          </h2>

          <p>
            Мне было около пяти лет.
            Мы с мамой были в путешествии.
            На площади играли дети,
            и мне очень хотелось
            подойти к ним.
          </p>

          <p>
            Но оказалось,
            что мы говорим
            на разных языках.
          </p>

          <p className="story-big">
            Тогда я впервые понял,
            что язык —
            это возможность
            знакомиться с людьми.
          </p>

        </div>

      </div>

    </section>
  );
}