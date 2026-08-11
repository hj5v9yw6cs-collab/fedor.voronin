import { QUESTIONS } from "./testQuestions";

const OWNER_EMAIL = "fedor1349666666@gmail.com";

function buildMessage({ name, contact, score, total, level, answers }) {
  const lines = [
    `Имя: ${name || "не указано"}`,
    `Контакт: ${contact || "не указан"}`,
    `Результат: ${score}/${total} — уровень ${level.code} (${level.label})`,
    "",
    "Ответы:",
    ...answers.map((item, i) => {
      const context = item.passage ?? item.audioText;
      const contextLine = context ? ` [${item.type}: "${context}"]` : "";
      const mark = item.picked === item.options[item.correct] ? "верно" : "неверно";
      return `${i + 1}. ${item.q}${contextLine} — ответ: ${item.picked ?? "—"} (${mark})`;
    }),
  ];
  return lines.join("\n");
}

// Posts straight to FormSubmit's plain (non-AJAX) endpoint via a hidden
// iframe, instead of `fetch`. This isn't just a style choice: FormSubmit's
// `/ajax/` endpoint won't send the one-time "Activate Form" email at all
// until the destination address has received a *plain* form submission
// first — an AJAX-only integration can end up never activating, which is
// what happened here. A real form POST is also what FormSubmit's own
// spam/activation flow is built around, so this is the reliable path,
// not a fallback.
function postViaHiddenForm(fields) {
  const frameName = `formsubmit-target-${Date.now()}`;
  const iframe = document.createElement("iframe");
  iframe.name = frameName;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const form = document.createElement("form");
  form.action = `https://formsubmit.co/${OWNER_EMAIL}`;
  form.method = "POST";
  form.target = frameName;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value ?? "";
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();

  // The navigation inside the iframe has already been kicked off
  // synchronously by .submit() — safe to clean up shortly after.
  setTimeout(() => {
    form.remove();
    iframe.remove();
  }, 5000);
}

/**
 * Sends a finished test to the owner's inbox via FormSubmit
 * (https://formsubmit.co) — a free form-to-email relay that needs no
 * signup or API key, just the destination address.
 *
 * IMPORTANT: the very first submission ever sent to an email address
 * doesn't deliver — FormSubmit instead emails that address an
 * "Activate Form" link. Someone has to click it once; every submission
 * after that arrives normally. See README.
 *
 * A plain form POST has no readable response (it's a cross-origin
 * navigation inside a hidden iframe), so unlike a `fetch` call there's
 * no way to detect failure here and fall back automatically. If nothing
 * ever arrives, the fix is almost always the one-time activation step
 * above, not a bug in this function.
 */
export async function sendTestResults({ name, contact, score, total, level, answers }) {
  const withPicks = QUESTIONS.map((item, i) => ({ ...item, picked: answers[i]?.text }));
  const message = buildMessage({ name, contact, score, total, level, answers: withPicks });
  const subject = `Результат теста — ${name || "аноним"} (${level.code})`;

  try {
    postViaHiddenForm({
      _subject: subject,
      _template: "box",
      _captcha: "false",
      name: name || "Аноним",
      contact,
      level: `${level.code} — ${level.label}`,
      score: `${score}/${total}`,
      message,
    });
    return { ok: true, method: "email" };
  } catch {
    // Only reachable if the DOM manipulation itself throws (e.g. no
    // `document` available) — genuinely unexpected in a browser.
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
    return { ok: true, method: "mailto" };
  }
}
