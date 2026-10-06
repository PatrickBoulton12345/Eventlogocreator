import type { NextRequest } from "next/server";
import { findCityPhotos, photoPlace } from "@/lib/photos";

// GET /api/photos?chapter=LFG Manchester
// The photo options for a chapter's city, for the picker in the form.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const chapter = req.nextUrl.searchParams.get("chapter")?.trim() ?? "";
  const place = photoPlace(chapter);
  if (!place) return Response.json({ place: "", photos: [] });
  const photos = await findCityPhotos(chapter, 8);
  return Response.json(
    { place, photos },
    { headers: { "Cache-Control": "public, s-maxage=86400" } },
  );
}
