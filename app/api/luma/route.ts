import type { NextRequest } from "next/server";
import { fetchLumaEvent } from "@/lib/luma-server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")?.trim();

  if (!url) {
    return Response.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return Response.json({ error: "That doesn't look like a valid URL" }, { status: 400 });
  }

  try {
    const result = await fetchLumaEvent(parsed);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result.event);
  } catch (err) {
    console.error("Luma fetch error:", err);
    return Response.json({ error: "Failed to reach Luma" }, { status: 500 });
  }
}
