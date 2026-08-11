import { QUESTIONS } from "./testQuestions";
import { supabase, isCabinetEnabled } from "./supabase";

const OWNER_EMAIL = "fedor1349666666@gmail.com";
const TELEGRAM = "https://t.me/fedorrpomidorr";
const INSTAGRAM = "https://instagram.com/fedorpomidorr";

// Technical breakdown for the owner — every question, what was picked,
// right or wrong, so a follow-up conversation can reference specifics.
function buildOwnerMessage({ name, contact, score, total, level, answers }) {
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

// Friendly note for the test-taker themselves — their result plus a way
// to actually reach the tutor, not a technical dump of every answer.
function buildStudentMessage({ name, score, total, level }) {
  const greeting = name ? `Привет, ${name}!` : "Привет!";
  return [
    greeting,
    "",
    `Ваш результат: ${score}/${total} — уровень ${level.code} (${level.label}).`,
    "",
    "Спасибо, что прошли тест! Если хотите обсудить занятия английским — просто напишите мне:",
    "",
    `Telegram: ${TELEGRAM}`,
    `Instagram: ${INSTAGRAM}`,
    `Почта: ${OWNER_EMAIL}`,
    "",
    "— Фёдор",
  ].join("\n");
}

/**
 * Sends a finished test both to the owner's inbox and to the address
 * the visitor left as their contact — two separate emails with
 * different content, via the `send-email` Supabase Edge Function
 * (which relays through Resend — see supabase/functions/send-email).
 * If the cabinet's Supabase project isn't configured, or the call to
 * the owner fails for any reason, falls back to opening the visitor's
 * own mail client with the results pre-filled (addressed to the owner
 * only — that fallback can't also email the visitor), so nothing is
 * silently lost either way.
 */
export async function sendTestResults({ name, contact, score, total, level, answers }) {
  const withPicks = QUESTIONS.map((item, i) => ({ ...item, picked: answers[i]?.text }));
  const ownerMessage = buildOwnerMessage({ name, contact, score, total, level, answers: withPicks });
  const subject = `Результат теста — ${name || "аноним"} (${level.code})`;

  if (isCabinetEnabled) {
    try {
      const { error } = await supabase.functions.invoke("send-email", {
        body: { to: OWNER_EMAIL, subject, text: ownerMessage },
      });
      if (!error) {
        if (contact) {
          const studentMessage = buildStudentMessage({ name, score, total, level });
          // Best-effort — a failed courtesy copy to the student
          // shouldn't undo the fact that the owner's copy already sent.
          supabase.functions
            .invoke("send-email", {
              body: { to: contact, subject: "Ваш результат теста по английскому", text: studentMessage },
            })
            .catch(() => {});
        }
        return { ok: true, method: "email" };
      }
    } catch {
      // fall through to mailto below
    }
  }

  const body = encodeURIComponent(ownerMessage);
  window.location.href = `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`;
  return { ok: true, method: "mailto" };
}
