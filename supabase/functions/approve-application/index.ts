// Approves a pending application: creates a real Supabase Auth user
// for the applicant, emails them their login, and marks the
// application approved. Called from TeacherView.jsx.
//
// verify_jwt is ON for this function (Dashboard → Functions →
// approve-application → Settings) — unlike send-email/send-reminders,
// this one performs a privileged, hard-to-undo action (creating a real
// login), so it requires a real signed-in session, and additionally
// checks below that the caller is specifically a teacher.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Fedor. English Studio <hello@fedorvoronin.ru>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function randomPassword() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  // Who's calling? Read the caller's own session off their JWT, then
  // look up their role — only a teacher may approve applications.
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const { data: callerData } = await admin.auth.getUser(token);
  const caller = callerData?.user;
  if (!caller) {
    return new Response(JSON.stringify({ error: "not signed in" }), {
      status: 401,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();
  if (callerProfile?.role !== "teacher") {
    return new Response(JSON.stringify({ error: "not a teacher" }), {
      status: 403,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const { applicationId } = await req.json();
    const { data: application, error: appError } = await admin
      .from("applications")
      .select("*")
      .eq("id", applicationId)
      .single();
    if (appError || !application) {
      return new Response(JSON.stringify({ error: "application not found" }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const password = randomPassword();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: application.contact_email,
      password,
      email_confirm: true,
      user_metadata: { full_name: application.name },
    });
    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    await admin.from("applications").update({ status: "approved" }).eq("id", applicationId);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: application.contact_email,
        subject: "Доступ в личный кабинет — Fedor. English Studio",
        text: [
          `Здравствуйте${application.name ? `, ${application.name}` : ""}!`,
          "",
          "Вам открыт доступ в личный кабинет.",
          "",
          `Почта: ${application.contact_email}`,
          `Пароль: ${password}`,
          "",
          "Войти можно на fedorvoronin.ru/cabinet — после входа советуем сменить пароль на свой (ссылка «забыли пароль?» на странице входа пришлёт вам форму для смены).",
        ].join("\n"),
      }),
    });

    return new Response(JSON.stringify({ ok: true, userId: created.user.id }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
