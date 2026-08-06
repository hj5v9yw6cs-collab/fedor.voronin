import { QUESTIONS } from "./testQuestions";

const OWNER_EMAIL = "fedor1349666666@gmail.com";

function buildMessage({ name, contact, score, total, level }) {
  const lines = [
    `Имя: ${name || "не указано"}`,
    `Контакт: ${contact || "не указан"}`,
    `Результат: ${score}/${total} — уровень ${level.code} (${level.label})`,
    "",
    "Ответы:",
    ...QUESTIONS.map((item, i) => {
      const context = item.passage ?? item.audioText;
      const contextLine = context ? ` [${item.type}: "${context}"]` : "";
      const mark = item.picked === item.options[item.correct] ? "верно" : "неверно";
      return `${i + 1}. ${item.q}${contextLine} — ответ: ${item.picked ?? "—"} (${mark})`;
    }),
  ];
  return lines.join("\n");
}

/**
 * Sends a finished test to the owner's inbox via FormSubmit
 * (https://formsubmit.co) — a free form-to-email relay that needs no
 * signup or API key, just the destination address.
 *
 * IMPORTANT: the very first submission ever sent to an email address
 * doesn't deliver — FormSubmit instead emails that address an
 * "Activate your form" link. Someone has to click it once; every
 * submission after that arrives normally. See README.
 *
 * If the request fails (offline, relay down, not yet activated with no
 * way to know), we fall back to opening the visitor's mail client with
 * the results pre-filled, so nothing is silently lost.
 */
export async function sendTestResults({ name, contact, score, total, level, answers }) {
  const withPicks = QUESTIONS.map((item, i) => ({ ...item, picked: answers[i]?.text }));
  const message = buildMessage({ name, contact, score, total, level, answers: withPicks });
  const subject = `Результат теста — ${name || "аноним"} (${level.code})`;

  try {
    const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _template: "box",
        name: name || "Аноним",
        contact,
        level: `${level.code} — ${level.label}`,
        score: `${score}/${total}`,
        message,
      }),
    });
    if (res.ok) return { ok: true, method: "email" };
  } catch {
    // network error — fall through to mailto below
  }

  const body = encodeURIComponent(message);
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
  return { ok: true, method: "mailto" };
}
