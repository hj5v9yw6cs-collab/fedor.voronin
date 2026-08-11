import { useState } from "react";
import "./Test.css";
import { QUESTIONS, getLevel } from "../lib/testQuestions";
import { sendTestResults } from "../lib/sendResults";
import { speak, canSpeak } from "../lib/speak";
import { useLanguage } from "../lib/i18nData";
import Ant from "./Ant";

const EMPTY_ANSWERS = Array(QUESTIONS.length).fill(null);

function ListenBlock({ text, listenLabel, listenAgainLabel }) {
  const [played, setPlayed] = useState(false);

  if (!canSpeak) {
    // No speech synthesis in this browser — fall back to a transcript
    // rather than silently breaking the question.
    return <p className="test-transcript">{text}</p>;
  }

  return (
    <button
      type="button"
      className="test-listen btn-burst"
      onClick={() => {
        speak(text);
        setPlayed(true);
      }}
    >
      <span className="test-listen-icon">{played ? "↻" : "▶"}</span>
      {played ? listenAgainLabel : listenLabel}
    </button>
  );
}

export default function Test() {
  const { strings } = useLanguage();
  const t = strings.test;

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

  const q = QUESTIONS[current];

  return (
    <section id="test" className="test">

      <Ant edge="top" duration="28s" delay="14s" size={16} />

      <div className="test-container">

        <span className="test-label">{t.label}</span>

        {step === "intro" && (
          <div className="test-intro">
            <h2>
              {t.introTitle.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < t.introTitle.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p>{t.introDescription(QUESTIONS.length)}</p>
            <button className="test-btn btn-burst" onClick={() => setStep("quiz")}>
              {t.startBtn}
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

            {q.type === "reading" && (
              <div className="test-passage">
                <span className="test-kind">{t.kindReading}</span>
                <p>{q.passage}</p>
              </div>
            )}

            {q.type === "listening" && (
              <div className="test-passage">
                <span className="test-kind">{t.kindListening}</span>
                <ListenBlock
                  text={q.audioText}
                  listenLabel={t.listen}
                  listenAgainLabel={t.listenAgain}
                />
              </div>
            )}

            <h3 className="test-question">{q.q}</h3>

            <div className="test-options">
              {q.options.map((opt, i) => (
                <button key={i} className="test-option btn-burst" onClick={() => pick(i)}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "contact" && (
          <form className="test-contact" onSubmit={submit}>
            <h2>{t.contactTitle}</h2>
            <p>{t.contactSubtitle}</p>

            <input
              type="text"
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="email"
              placeholder={t.contactPlaceholder}
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />

            <button type="submit" className="test-btn btn-burst">
              {t.submitBtn}
            </button>
          </form>
        )}

        {step === "sending" && (
          <div className="test-intro">
            <h2>{t.sending}</h2>
          </div>
        )}

        {step === "done" && result && (
          <div className="test-result">
            <span className="test-result-code">{result.level.code}</span>
            <h2>{t.levels[result.level.code]}</h2>
            <p>
              {t.resultCorrect(result.score, QUESTIONS.length)}
              <br />
              {t.resultNote}
            </p>
            <button className="test-btn btn-burst" onClick={reset}>
              {t.retryBtn}
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
