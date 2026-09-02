import type { NextRequest } from "next/server";
import { geocodeLocation } from "@/lib/geocode";

// GET /api/geocode?q=The Castle, Manchester
// Used by the form to find the venue on the map as you type it in.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return Response.json({ error: "Missing q" }, { status: 400 });

  const found = await geocodeLocation(q);
  return Response.json(found ?? { lat: null, lng: null }, {
    headers: { "Cache-Control": "public, max-age=86400" },
  });
}
