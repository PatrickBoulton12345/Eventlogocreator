import type { NextRequest } from "next/server";
import { findCityPhotos, photoPlace } from "@/lib/photos";

// GET /api/photos?chapter=LFG Manchester&page=2
// The photo options for a chapter's city, for the picker in the form,
// eight at a time. An empty list on a later page means no more were found.

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const chapter = req.nextUrl.searchParams.get("chapter")?.trim() ?? "";
  const place = photoPlace(chapter);
  if (!place) return Response.json({ place: "", photos: [] });
  const page = Math.min(Math.max(Number(req.nextUrl.searchParams.get("page")) || 1, 1), 20);
  const photos = await findCityPhotos(chapter, 8, page);
  return Response.json(
    { place, photos },
    { headers: { "Cache-Control": "public, s-maxage=86400" } },
  );
}
