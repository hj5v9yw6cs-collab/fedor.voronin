import "./Hero.css";
import StickerPhoto from "./StickerPhoto";
import ScrollIndicator from "./ScrollIndicator";
import { useLanguage } from "../lib/i18nData";

export default function Hero() {
  const { strings } = useLanguage();

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero-container">

        <div className="hero-left">

          <span className="hero-label">
            {strings.hero.label}
          </span>

          <h1 className="hero-title">
            {strings.hero.title.map((line, i) => (
              <span key={i}>
                {line}
                {i < strings.hero.title.length - 1 && <br />}
              </span>
            ))}
          </h1>

          <p className="hero-description">
            {strings.hero.description}
          </p>

          <div className="hero-buttons">

            <button className="primary-btn btn-burst" onClick={scrollTo("test")}>
              {strings.hero.primaryBtn}
            </button>

            <button
              className="secondary-btn btn-burst"
              onClick={scrollTo("story")}
            >
              {strings.hero.secondaryBtn}
            </button>

          </div>

          <ScrollIndicator />

        </div>

        <div className="hero-right">
          <StickerPhoto />
        </div>

      </div>
    </section>
  );
}
