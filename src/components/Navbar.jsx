import "./Navbar.css";
import Clover from "./Clover";

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
          <Clover size={30} />
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
          className="navbar-cta"
          onClick={(e) => scrollTo(e, "#test")}
        >
          пройти тест
        </a>
      </div>
    </header>
  );
}
