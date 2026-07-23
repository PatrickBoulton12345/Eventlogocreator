import type { NextRequest } from "next/server";
import { fetchLumaEvent } from "@/lib/luma-server";
import { buildCardData } from "@/lib/autofill";
import { buildExportFilename, getEventTypeLabel } from "@/lib/types";
import { launchBrowser, renderCardJpeg } from "@/lib/render";

// GET /api/card?luma=<lu.ma or luma.com link>
// Fetches the event details from Luma, fills in the card automatically,
// renders it in a headless browser, and returns the finished 1080×1350
// JPEG. Optional overrides: &chapter= &type= &date= &time= &location=

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const lumaUrl = req.nextUrl.searchParams.get("luma")?.trim();
  if (!lumaUrl) {
    return Response.json(
      { error: "Missing luma parameter, e.g. /api/card?luma=https://luma.com/..." },
      { status: 400 },
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(lumaUrl);
  } catch {
    return Response.json(
      { error: "That doesn't look like a valid URL" },
      { status: 400 },
    );
  }

  const result = await fetchLumaEvent(parsed).catch(() => null);
  if (!result) {
    return Response.json({ error: "Failed to reach Luma" }, { status: 502 });
  }
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const data = buildCardData(result.event);

  // Optional manual overrides, e.g. &chapter=LFG Leeds&type=hackathon
  // &date=2026-07-30&time=18:30&location=The Red Deer, Sheffield
  const overrideChapter = req.nextUrl.searchParams.get("chapter")?.trim();
  if (overrideChapter) data.chapter = overrideChapter;
  const overrideDate = req.nextUrl.searchParams.get("date")?.trim();
  if (overrideDate) data.date = overrideDate;
  const overrideTime = req.nextUrl.searchParams.get("time")?.trim();
  if (overrideTime) data.time = overrideTime;
  const overrideLocation = req.nextUrl.searchParams.get("location")?.trim();
  if (overrideLocation) data.location = overrideLocation;
  const overrideType = req.nextUrl.searchParams.get("type")?.trim();
  if (
    overrideType === "hackathon" ||
    overrideType === "litter-pick" ||
    overrideType === "pub-social" ||
    overrideType === "custom"
  ) {
    data.eventType = overrideType;
    if (overrideType === "custom" && !data.customEventLabel) {
      data.customEventLabel = result.event.name.toLowerCase();
    }
  }

  let browser;
  try {
    browser = await launchBrowser();
    const jpeg = await renderCardJpeg(browser, data, req.nextUrl.origin);

    const filename = buildExportFilename(data);
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Event-Name": encodeURIComponent(result.event.name),
        "X-Event-Type": getEventTypeLabel(data),
        "X-Event-Chapter": encodeURIComponent(data.chapter),
        "X-Event-Date": data.date,
      },
    });
  } catch (err) {
    console.error("Card render error:", err);
    return Response.json(
      { error: "Failed to render the card image" },
      { status: 500 },
    );
  } finally {
    await browser?.close().catch(() => {});
  }
}
