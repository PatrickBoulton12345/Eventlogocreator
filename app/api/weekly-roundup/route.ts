import type { NextRequest } from "next/server";
import { fetchCalendarEvents, LFG_CALENDAR_URL } from "@/lib/calendar";
import {
  buildEmailHtml,
  buildSubject,
  splitEvents,
  weekWindow,
} from "@/lib/roundup";

// GET /api/weekly-roundup
//   ?preview=1  -> returns the email HTML in the browser (no send, no auth)
//   otherwise   -> builds and sends the roundup email (Vercel Cron / manual)
//
// Cron: vercel.json runs this at "0 7 * * 0" — 07:00 UTC every Sunday.
// Vercel Cron only understands UTC, and the UK clock shifts: 07:00 UTC is
// 08:00 during British Summer Time (late Mar–late Oct) and 07:00 in winter
// (GMT). The pragmatic choice is to pin 07:00 UTC so the email lands at the
// requested 08:00 through the summer season (when most socials run), and an
// hour earlier (07:00) over winter — acceptable for a Sunday-morning digest,
// and avoids the complexity of a DST-aware scheduler.
//
// Protected by CRON_SECRET: Vercel Cron sends "Authorization: Bearer <secret>".

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const isPreview = req.nextUrl.searchParams.get("preview") === "1";

  // Auth: real sends require the cron secret. Preview is open (harmless HTML).
  if (!isPreview) {
    const secret = process.env.CRON_SECRET;
    const auth = req.headers.get("authorization");
    if (secret && auth !== `Bearer ${secret}`) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let events;
  try {
    events = await fetchCalendarEvents(LFG_CALENDAR_URL);
  } catch (err) {
    console.error("Roundup calendar error:", err);
    return Response.json(
      { error: "Couldn't read the LFG calendar" },
      { status: 502 },
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const { monday } = weekWindow(today);
  const { thisWeek, comingUp } = splitEvents(events, today);
  const html = buildEmailHtml({ monday, thisWeek, comingUp });
  const subject = buildSubject(monday);

  if (isPreview) {
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.ROUNDUP_TO_EMAIL;
  const from = process.env.ROUNDUP_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    return Response.json(
      {
        error:
          "Missing email config: set BREVO_API_KEY, ROUNDUP_TO_EMAIL, ROUNDUP_FROM_EMAIL",
      },
      { status: 500 },
    );
  }

  try {
    const sender = parseAddress(from);
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("Brevo error:", res.status, detail);
      return Response.json(
        { error: "Email send failed", status: res.status, detail },
        { status: 502 },
      );
    }

    const data = (await res.json().catch(() => ({}))) as { messageId?: string };
    return Response.json({
      sent: true,
      id: data.messageId,
      subject,
      thisWeek: thisWeek.length,
      comingUp: comingUp.length,
    });
  } catch (err) {
    console.error("Roundup send error:", err);
    return Response.json({ error: "Email send failed" }, { status: 500 });
  }
}

// Accepts "hi@lfg.uk" or "LFG <hi@lfg.uk>" and returns Brevo's sender shape.
function parseAddress(value: string): { email: string; name?: string } {
  const m = value.match(/^\s*(.*?)\s*<\s*(.+?)\s*>\s*$/);
  if (m) return { name: m[1] || undefined, email: m[2] };
  return { email: value.trim() };
}
