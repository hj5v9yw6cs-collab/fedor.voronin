import "./Footer.css";
import Clover from "./Clover";

const YEAR = new Date().getFullYear();

function scrollTo(e, href) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  return (
    <footer id="footer" className="site-footer">
      <div className="footer-top">

        <div className="footer-brand">
          <div className="footer-brand-row">
            <Clover size={26} />
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
        <Clover size={100} withSeeds />
      </div>

      <div className="footer-bottom">
        <span>© {YEAR} Fedor. English Studio</span>

        <div className="footer-lang">
          <button className="is-active">RU</button>
          <span>/</span>
          <button>EN</button>
        </div>
      </div>
    </footer>
  );
}
