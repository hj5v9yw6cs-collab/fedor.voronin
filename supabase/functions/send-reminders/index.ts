// Scans lessons starting in ~5 hours that haven't had a reminder sent
// yet, and emails the student for each one via Resend. Triggered on a
// schedule by pg_cron (see the commented-out block at the bottom of
// supabase/schema.sql) — not meant to be called from the site itself.
//
// verify_jwt is OFF for this function (Dashboard → Functions →
// send-reminders → Settings) because pg_cron's net.http_post call
// carries no user session. Safe to leave open: it takes no input from
// the caller, and re-running it is a no-op for lessons that already
// have reminder_sent_at set.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Auto-provided in every Edge Function's environment — no manual
// secret needed for these two.
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Fedor. English Studio <hello@fedorvoronin.ru>";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function formatDate(iso) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  });
}

async function sendReminder(student, lesson) {
  const lines = [
    `Здравствуйте${student.full_name ? `, ${student.full_name}` : ""}!`,
    "",
    `Напоминаем: у вас занятие ${formatDate(lesson.scheduled_at)}.`,
  ];
  if (lesson.topic) lines.push(`Тема: ${lesson.topic}`);
  if (lesson.meeting_url) lines.push(`Ссылка на урок: ${lesson.meeting_url}`);
  if (lesson.homework) lines.push(`Домашнее задание: ${lesson.homework}`);
  lines.push("", "Подробности — в личном кабинете на fedorvoronin.ru/cabinet");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: student.email,
      subject: "Напоминание о занятии по английскому",
      text: lines.join("\n"),
    }),
  });
  return res.ok;
}

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const now = Date.now();
  // Cron runs every 15 minutes, so a ±15-minute window around "5 hours
  // from now" catches each lesson exactly once regardless of exactly
  // when in that window the cron tick lands.
  const windowStart = new Date(now + 4.75 * 3600 * 1000).toISOString();
  const windowEnd = new Date(now + 5.25 * 3600 * 1000).toISOString();

  const { data: lessons, error } = await supabase
    .from("lessons")
    .select("*, profiles!lessons_student_id_fkey(full_name, email)")
    .gte("scheduled_at", windowStart)
    .lte("scheduled_at", windowEnd)
    .is("reminder_sent_at", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let sent = 0;
  for (const lesson of lessons ?? []) {
    const student = lesson.profiles;
    if (!student?.email) continue;
    const ok = await sendReminder(student, lesson);
    if (ok) {
      await supabase
        .from("lessons")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", lesson.id);
      sent++;
    }
  }

  return new Response(JSON.stringify({ ok: true, checked: lessons?.length ?? 0, sent }), {
    headers: { "Content-Type": "application/json" },
  });
});
