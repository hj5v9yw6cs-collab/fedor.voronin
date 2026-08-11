import { QUESTIONS } from "./testQuestions";
import { supabase, isCabinetEnabled } from "./supabase";

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

/**
 * Sends a finished test both to the owner's inbox and to the address
 * the visitor left as their contact, via the `send-email` Supabase Edge
 * Function (which relays through Resend — see
 * supabase/functions/send-email). If the cabinet's Supabase project
 * isn't configured, or the call fails for any reason, falls back to
 * opening the visitor's own mail client with the results pre-filled
 * (addressed to the owner only — that fallback can't also BCC the
 * visitor), so nothing is silently lost either way.
 */
export async function sendTestResults({ name, contact, score, total, level, answers }) {
  const withPicks = QUESTIONS.map((item, i) => ({ ...item, picked: answers[i]?.text }));
  const message = buildMessage({ name, contact, score, total, level, answers: withPicks });
  const subject = `Результат теста — ${name || "аноним"} (${level.code})`;

  if (isCabinetEnabled) {
    try {
      const recipients = contact ? [OWNER_EMAIL, contact] : [OWNER_EMAIL];
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to: recipients, subject, text: message },
      });
      if (!error) return { ok: true, method: "email" };
    } catch {
      // fall through to mailto below
    }
  }

  const body = encodeURIComponent(message);
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
  return { ok: true, method: "mailto" };
}
