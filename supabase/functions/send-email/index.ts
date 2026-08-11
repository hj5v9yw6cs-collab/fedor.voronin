// Generic outbound-email Edge Function, backed by Resend
// (https://resend.com). Deployed via the Supabase Dashboard's Edge
// Functions editor — see README.md "Письма через Resend" for setup.
//
// Called by two places in the site, both just passing {to, subject, text}:
//   - src/lib/sendResults.js         — test results, sent to the owner
//   - src/components/cabinet/TeacherView.jsx — new-lesson notice, sent to a student
//
// JWT verification is turned OFF for this function (set in its Dashboard
// settings) because sendResults.js is called by anonymous site visitors
// taking the test, who have no Supabase session at all. That does mean
// anyone who finds the function's URL could make it send mail through
// our Resend account — acceptable here given Resend's free tier is a
// hard 3000/month cap (worst case is hitting that quota, not runaway
// cost), same exposure level the old FormSubmit integration already had.

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Resend's shared sandbox sender — works immediately, no domain setup.
// Swap for something like "Fedor. English Studio <hello@fedorvoronin.ru>"
// once fedorvoronin.ru is verified as a sending domain in Resend, for a
// less spam-flaggy from-address.
const FROM = "Fedor. English Studio <onboarding@resend.dev>";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  try {
    const { to, subject, text } = await req.json();
    if (!to || !subject || !text) {
      return new Response(JSON.stringify({ error: "missing to/subject/text" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });

    if (!res.ok) {
      const body = await res.text();
      return new Response(JSON.stringify({ error: body }), {
        status: 502,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
