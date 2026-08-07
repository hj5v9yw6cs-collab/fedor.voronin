import "./Features.css";
import Ant from "./Ant";
import { useLanguage } from "../lib/i18nData";

export default function Features() {
  const { strings } = useLanguage();
  const levels = strings.features.levels;

  return (
    <section className="features">

      <Ant edge="top" duration="34s" delay="9s" size={16} />

      <div className="features-container">

        <span className="features-label">{strings.features.label}</span>

        <h2 className="features-title">
          {strings.features.title.map((line, i) => (
            <span key={i}>
              {line}
              {i < strings.features.title.length - 1 && <br />}
            </span>
          ))}
        </h2>

        <div className="features-grid">
          {levels.map((l, i) => (
            <div className="features-item" key={l.code}>
              <span className="features-num">0{i + 1}</span>
              <span className="features-code">{l.code}</span>
              <h3>{l.label}</h3>
              <p>{l.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
