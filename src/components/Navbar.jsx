import "./Navbar.css";
import Flower from "./Flower";
import Ant from "./Ant";

const LINKS = [
  { href: "#story", label: "история" },
  { href: "#test", label: "тест" },
  { href: "#reviews", label: "отзывы" },
  { href: "#footer", label: "контакты" },
];

function scrollTo(e, href) {
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
}

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="#" className="navbar-brand" onClick={(e) => scrollTo(e, "body")}>
          <Flower size={30} fallDistance={42} />
          <div className="navbar-brand-text">
            <span className="navbar-name">Fedor.</span>
            <span className="navbar-tag">english studio</span>
          </div>
        </a>

        <nav className="navbar-nav">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={(e) => scrollTo(e, l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href="#test"
          className="navbar-cta btn-burst"
          onClick={(e) => scrollTo(e, "#test")}
        >
          пройти тест
        </a>
      </div>
      <Ant edge="bottom" duration="26s" delay="1s" size={16} />
    </header>
  );
}
