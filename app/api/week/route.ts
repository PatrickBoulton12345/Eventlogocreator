import type { NextRequest } from "next/server";
import {
  fetchCalendarEvents,
  filterWithinDays,
  LFG_CALENDAR_URL,
} from "@/lib/calendar";

// GET /api/week?days=7&calendar=<optional calendar url>
// Returns the LFG events happening between today and `days` days from now,
// so the /week page can preview them. Card images are loaded separately by
// the page via /api/card, and the ZIP is built by /api/week-zip.

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "7") || 7;
  const calendar =
    req.nextUrl.searchParams.get("calendar")?.trim() || LFG_CALENDAR_URL;

  try {
    const all = await fetchCalendarEvents(calendar);
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = filterWithinDays(all, today, days);
    return Response.json({ today, days, count: upcoming.length, events: upcoming });
  } catch (err) {
    console.error("Week list error:", err);
    return Response.json(
      { error: "Couldn't read the LFG calendar" },
      { status: 502 },
    );
  }
}
