import "./Hero.css";
import StickerPhoto from "./StickerPhoto";
import ScrollIndicator from "./ScrollIndicator";

export default function Hero() {
  const scrollToStory = () => {
    document.getElementById("story")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <section className="hero">
      <div className="hero-container">

        <div className="hero-left">

          <span className="hero-label">
            ✦ АНГЛИЙСКИЙ С ФЕДОРОМ
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

            <button className="primary-btn">
              Пройти тест
            </button>

            <button
              className="secondary-btn"
              onClick={scrollToStory}
            >
              Моя история
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