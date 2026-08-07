import "./Navbar.css";
import Flower from "./Flower";
import Ant from "./Ant";
import Bunting from "./Bunting";
import { useLanguage } from "../lib/i18nData";

function scrollTo(e, href) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const { lang, setLang, strings } = useLanguage();
  const links = [
    { href: "#story", label: strings.nav.story },
    { href: "#test", label: strings.nav.test },
    { href: "#reviews", label: strings.nav.reviews },
    { href: "#footer", label: strings.nav.contacts },
  ];

  return (
    <header className="navbar">
      <Bunting />
      <div className="navbar-inner">
        <a href="#" className="navbar-brand" onClick={(e) => scrollTo(e, "body")}>
          <Flower size={30} floorSelector=".navbar" floorEdge="bottom" />
          <div className="navbar-brand-text">
            <span className="navbar-name">Fedor.</span>
            <span className="navbar-tag">english studio</span>
          </div>
        </a>

        <nav className="navbar-nav">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="navbar-right">
          <div className="navbar-lang">
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

          <a
            href="#test"
            className="navbar-cta btn-burst"
            onClick={(e) => scrollTo(e, "#test")}
          >
            {strings.nav.cta}
          </a>
        </div>
      </div>
      <Ant edge="bottom" duration="26s" delay="1s" size={16} />
    </header>
  );
}
