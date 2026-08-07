import "./Footer.css";
import Flower from "./Flower";
import Ant from "./Ant";
import { useLanguage } from "../lib/i18nData";

const YEAR = new Date().getFullYear();

function scrollTo(e, href) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Footer() {
  const { lang, setLang, strings } = useLanguage();
  const t = strings.footer;

  return (
    <footer id="footer" className="site-footer">

      <Ant edge="top" duration="32s" delay="6s" size={16} />

      <div className="footer-top">

        <div className="footer-brand">
          <div className="footer-brand-row">
            <Flower size={26} static />
            <span>{t.brandName}</span>
          </div>
          <p>
            {t.tagline.split("\n").map((line, i) => (
              <span key={i}>
                {line}
                {i < t.tagline.split("\n").length - 1 && <br />}
              </span>
            ))}
          </p>
        </div>

        <div className="footer-col">
          <span className="footer-heading">{t.navHeading}</span>
          <a href="#story" onClick={(e) => scrollTo(e, "#story")}>{strings.nav.story}</a>
          <a href="#test" onClick={(e) => scrollTo(e, "#test")}>{strings.nav.test}</a>
        </div>

        <div className="footer-col">
          <span className="footer-heading">{t.contactHeading}</span>
          <a href="mailto:fedor1349666666@gmail.com">
            fedor1349666666@gmail.com
          </a>
          <a href="https://t.me/fedorrpomidorr" target="_blank" rel="noreferrer">
            telegram
          </a>
          <a href="https://instagram.com/fedorpomidorr" target="_blank" rel="noreferrer">
            instagram
          </a>
        </div>

      </div>

      <div className="footer-mark">
        <Flower size={100} floorSelector=".footer-bottom" floorEdge="top" />
      </div>

      <div className="footer-bottom">
        <span>{t.copyright(YEAR)}</span>

        <div className="footer-legal">
          <a href="/privacy.html">{t.privacy}</a>
          <span>/</span>
          <a href="/terms.html">{t.terms}</a>
        </div>

        <div className="footer-lang">
          <button
            className={`btn-burst${lang === "ru" ? " is-active" : ""}`}
            onClick={() => setLang("ru")}
          >
            RU
          </button>
          <span>/</span>
          <button
            className={`btn-burst${lang === "en" ? " is-active" : ""}`}
            onClick={() => setLang("en")}
          >
            EN
          </button>
        </div>
      </div>
    </footer>
  );
}
