import "./Hero.css";
import StickerPhoto from "./StickerPhoto";
import ScrollIndicator from "./ScrollIndicator";
import Flower from "./Flower";

export default function Hero() {
  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero">
      <div className="hero-container">

        <div className="hero-left">

          <span className="hero-label">
            английский с федором
          </span>

          <h1 className="hero-title">
            Узнайте
            <br />
            свой уровень
            <br />
            английского.
          </h1>

          <p className="hero-description">
            Бесплатный интерактивный тест,
            который определит ваш уровень
            и покажет, что делать дальше.
          </p>

          <div className="hero-buttons">

            <button className="primary-btn" onClick={scrollTo("test")}>
              Пройти тест
            </button>

            <button
              className="secondary-btn"
              onClick={scrollTo("story")}
            >
              Моя история
            </button>

          </div>

          <ScrollIndicator />

        </div>

        <div className="hero-right">
          <Flower size={72} withPetals className="hero-flower" />
          <StickerPhoto />
        </div>

      </div>
    </section>
  );
}
