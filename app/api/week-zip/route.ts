import type { NextRequest } from "next/server";
import JSZip from "jszip";
import {
  fetchCalendarEvents,
  filterWithinDays,
  LFG_CALENDAR_URL,
} from "@/lib/calendar";
import { fetchLumaEvent } from "@/lib/luma-server";
import { buildCardData } from "@/lib/autofill";
import { buildExportFilename } from "@/lib/types";
import { launchBrowser, renderCardJpeg } from "@/lib/render";

// GET /api/week-zip?days=7&calendar=<optional>
// Builds every card for the next `days` days and returns them all as one
// ZIP file. Reuses a single headless browser for the whole batch.

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "7") || 7;
  const calendar =
    req.nextUrl.searchParams.get("calendar")?.trim() || LFG_CALENDAR_URL;

  let events;
  try {
    const all = await fetchCalendarEvents(calendar);
    const today = new Date().toISOString().slice(0, 10);
    events = filterWithinDays(all, today, days);
  } catch (err) {
    console.error("Week-zip calendar error:", err);
    return Response.json(
      { error: "Couldn't read the LFG calendar" },
      { status: 502 },
    );
  }

  if (events.length === 0) {
    return Response.json(
      { error: `No LFG events found in the next ${days} days` },
      { status: 404 },
    );
  }

  const zip = new JSZip();
  const skipped: string[] = [];
  let browser;
  try {
    browser = await launchBrowser();

    for (const ev of events) {
      try {
        const parsed = new URL(ev.url);
        const result = await fetchLumaEvent(parsed);
        if ("error" in result) {
          skipped.push(`${ev.name} — ${result.error}`);
          continue;
        }
        const data = buildCardData(result.event);
        const jpeg = await renderCardJpeg(browser, data, req.nextUrl.origin);
        const name = `${ev.date} ${buildExportFilename(data)}`;
        zip.file(name, jpeg);
      } catch (err) {
        console.error(`Card failed for ${ev.url}:`, err);
        skipped.push(`${ev.name} — render failed`);
      }
    }

    const entries = Object.keys(zip.files).length;
    if (entries === 0) {
      return Response.json(
        { error: "Every card failed to build", detail: skipped },
        { status: 500 },
      );
    }

    const buf = await zip.generateAsync({ type: "nodebuffer" });
    const today = new Date().toISOString().slice(0, 10);
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="lfg-event-cards-${today}.zip"`,
        "X-Cards-Included": String(entries),
        "X-Cards-Skipped": String(skipped.length),
      },
    });
  } catch (err) {
    console.error("Week-zip render error:", err);
    return Response.json(
      { error: "Failed to build the card bundle" },
      { status: 500 },
    );
  } finally {
    await browser?.close().catch(() => {});
  }
}
