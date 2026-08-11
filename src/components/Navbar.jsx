import "./Navbar.css";
import { Link } from "react-router-dom";
import Flower from "./Flower";
import Bunting from "./Bunting";
import { useLanguage } from "../lib/i18nData";
import { useAuth } from "../lib/authData";

function scrollTo(e, href) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  const { lang, setLang, strings } = useLanguage();
  const { user } = useAuth();
  const links = [
    { href: "#story", label: strings.nav.story },
    { href: "#test", label: strings.nav.test },
    { href: "#footer", label: strings.nav.contacts },
  ];

  return (
    <header className="navbar">
      <Bunting />
      <div className="navbar-inner">
        <a href="#" className="navbar-brand" onClick={(e) => scrollTo(e, "body")}>
          <Flower size={30} floorSelector=".navbar" floorEdge="bottom" wind={420} />
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
          {/* Kept outside .navbar-nav (hidden below 900px) — unlike the
              other links, this leads to a separate page, not a section
              you can just scroll to, so it needs to stay reachable on
              mobile too. */}
          <Link to="/cabinet" className="navbar-cabinet">
            {strings.nav.cabinet}
          </Link>

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

          {!user && (
            <a
              href="#test"
              className="navbar-cta btn-burst"
              onClick={(e) => scrollTo(e, "#test")}
            >
              {strings.nav.cta}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
