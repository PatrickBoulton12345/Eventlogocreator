import type { NextRequest } from "next/server";
import { fetchLumaEvent } from "@/lib/luma-server";
import { buildCaption } from "@/lib/caption";

// GET /api/caption?luma=<lu.ma or luma.com link>
// Returns the plain-text Instagram caption for a single event. Used by the
// Google Drive automation (and handy for manual copy).

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const lumaUrl = req.nextUrl.searchParams.get("luma")?.trim();
  if (!lumaUrl) {
    return Response.json({ error: "Missing luma parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(lumaUrl);
  } catch {
    return Response.json({ error: "Invalid URL" }, { status: 400 });
  }

  const result = await fetchLumaEvent(parsed).catch(() => null);
  if (!result) {
    return Response.json({ error: "Failed to reach Luma" }, { status: 502 });
  }
  if ("error" in result) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const ev = result.event;
  const caption = buildCaption({
    name: ev.name,
    startDate: `${ev.date}T${ev.time || "00:00"}:00`,
    endDate: "",
    date: ev.date,
    url: ev.signupUrl || parsed.toString(),
    venue: ev.location,
  });

  return new Response(caption, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
