import "./Footer.css";
import Flower from "./Flower";
import Ant from "./Ant";

const YEAR = new Date().getFullYear();

function scrollTo(e, href) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer id="footer" className="site-footer">

      <Ant edge="top" duration="32s" delay="6s" size={16} />

      <div className="footer-top">

        <div className="footer-brand">
          <div className="footer-brand-row">
            <Flower size={26} floorSelector=".footer-brand" floorEdge="bottom" />
            <span>Fedor.</span>
          </div>
          <p>
            Помогаю говорить по-английски
            свободно — с нуля и до
            продвинутого уровня.
          </p>
        </div>

        <div className="footer-col">
          <span className="footer-heading">навигация</span>
          <a href="#story" onClick={(e) => scrollTo(e, "#story")}>история</a>
          <a href="#test" onClick={(e) => scrollTo(e, "#test")}>тест</a>
          <a href="#reviews" onClick={(e) => scrollTo(e, "#reviews")}>отзывы</a>
        </div>

        <div className="footer-col">
          <span className="footer-heading">связаться</span>
          <a href="mailto:fedor1349666666@gmail.com">
            fedor1349666666@gmail.com
          </a>
        </div>

      </div>

      <div className="footer-mark">
        <Flower size={100} floorSelector=".footer-bottom" floorEdge="top" />
      </div>

      <div className="footer-bottom">
        <span>© {YEAR} Fedor. English Studio</span>

        <div className="footer-lang">
          <button className="is-active btn-burst">RU</button>
          <span>/</span>
          <button className="btn-burst">EN</button>
        </div>
      </div>
    </footer>
  );
}
