import { QUESTIONS } from "./testQuestions";

const OWNER_EMAIL = "fedor1349666666@gmail.com";

function buildMessage({ name, contact, score, total, level }) {
  const lines = [
    `Имя: ${name || "не указано"}`,
    `Контакт: ${contact || "не указан"}`,
    `Результат: ${score}/${total} — уровень ${level.code} (${level.label})`,
    "",
    "Ответы:",
    ...QUESTIONS.map((item, i) => `${i + 1}. ${item.q} — ${item.picked ?? "—"}`),
  ];
  return lines.join("\n");
}

/**
 * Sends a finished test to the owner's inbox.
 *
 * Primary path: Web3Forms (a static-site-friendly form-to-email API, no
 * backend needed) — set VITE_WEB3FORMS_KEY in .env to enable it.
 * Fallback: opens the visitor's mail client with the results pre-filled,
 * so results still reach the owner even before that key is configured.
 */
export async function sendTestResults({ name, contact, score, total, level, answers }) {
  const withPicks = QUESTIONS.map((item, i) => ({ ...item, picked: answers[i]?.text }));
  const message = buildMessage({ name, contact, score, total, level, answers: withPicks });
  const subject = `Результат теста — ${name || "аноним"} (${level.code})`;

  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;

  if (accessKey) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject,
          from_name: "Тест на сайте Fedor.",
          name: name || "Аноним",
          contact,
          level: `${level.code} — ${level.label}`,
          score: `${score}/${total}`,
          message,
        }),
      });
      const data = await res.json();
      if (data.success) return { ok: true, method: "email" };
    } catch {
      // network error — fall through to mailto below
    }
  }

  const body = encodeURIComponent(message);
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
  return { ok: true, method: "mailto" };
}
