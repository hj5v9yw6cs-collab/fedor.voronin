import { useState } from "react";
import "./Test.css";
import { QUESTIONS, getLevel } from "../lib/testQuestions";
import { sendTestResults } from "../lib/sendResults";

const EMPTY_ANSWERS = Array(QUESTIONS.length).fill(null);

export default function Test() {
  const [step, setStep] = useState("intro"); // intro | quiz | contact | sending | done
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(EMPTY_ANSWERS);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [result, setResult] = useState(null);

  const reset = () => {
    setStep("intro");
    setCurrent(0);
    setAnswers(EMPTY_ANSWERS);
    setName("");
    setContact("");
    setResult(null);
  };

  const pick = (optionIndex) => {
    const q = QUESTIONS[current];
    const next = answers.slice();
    next[current] = { index: optionIndex, text: q.options[optionIndex] };
    setAnswers(next);

    setTimeout(() => {
      if (current + 1 < QUESTIONS.length) {
        setCurrent(current + 1);
      } else {
        setStep("contact");
      }
    }, 250);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!contact.trim()) return;

    const score = answers.reduce(
      (acc, a, i) => acc + (a?.index === QUESTIONS[i].correct ? 1 : 0),
      0
    );
    const level = getLevel(score);

    setStep("sending");
    await sendTestResults({
      name: name.trim(),
      contact: contact.trim(),
      score,
      total: QUESTIONS.length,
      level,
      answers,
    });

    setResult({ score, level });
    setStep("done");
  };

  return (
    <section id="test" className="test">
      <div className="test-container">

        <span className="test-label">тест</span>

        {step === "intro" && (
          <div className="test-intro">
            <h2>
              Узнайте свой
              <br />
              уровень за 3 минуты.
            </h2>
            <p>
              {QUESTIONS.length} коротких вопросов на грамматику
              и лексику. В конце — ваш уровень по шкале CEFR
              и рекомендация, с чего начать.
            </p>
            <button className="test-btn" onClick={() => setStep("quiz")}>
              начать тест
            </button>
          </div>
        )}

        {step === "quiz" && (
          <div className="test-quiz">
            <div className="test-progress">
              <span>{String(current + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}</span>
              <div className="test-progress-bar">
                <div
                  className="test-progress-fill"
                  style={{ width: `${((current) / QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="test-question">{QUESTIONS[current].q}</h3>

            <div className="test-options">
              {QUESTIONS[current].options.map((opt, i) => (
                <button key={i} className="test-option" onClick={() => pick(i)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "contact" && (
          <form className="test-contact" onSubmit={submit}>
            <h2>Почти готово.</h2>
            <p>Куда прислать результат?</p>

            <input
              type="text"
              placeholder="имя (необязательно)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="email или telegram"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />

            <button type="submit" className="test-btn">
              получить результат
            </button>
          </form>
        )}

        {step === "sending" && (
          <div className="test-intro">
            <h2>Считаем результат…</h2>
          </div>
        )}

        {step === "done" && result && (
          <div className="test-result">
            <span className="test-result-code">{result.level.code}</span>
            <h2>{result.level.label}</h2>
            <p>
              Правильных ответов: {result.score} из {QUESTIONS.length}.
              <br />
              Результат также отправлен на почту — скоро свяжусь с вами.
            </p>
            <button className="test-btn" onClick={reset}>
              пройти ещё раз
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
