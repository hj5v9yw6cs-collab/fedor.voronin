import "./Features.css";

const LEVELS = [
  { code: "A1–A2", label: "Начальный", desc: "Базовые фразы, простые диалоги." },
  { code: "B1", label: "Средний", desc: "Свободно на бытовые темы." },
  { code: "B2", label: "Выше среднего", desc: "Работа, учёба, сложные тексты." },
  { code: "C1+", label: "Продвинутый", desc: "Свободное владение, нюансы." },
];

export default function Features() {
  return (
    <section className="features">
      <div className="features-container">

        <span className="features-label">уровни</span>

        <h2 className="features-title">
          От «hello»
          <br />
          до свободной речи.
        </h2>

        <div className="features-grid">
          {LEVELS.map((l, i) => (
            <div className="features-item" key={l.code}>
              <span className="features-num">0{i + 1}</span>
              <span className="features-code">{l.code}</span>
              <h3>{l.label}</h3>
              <p>{l.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
