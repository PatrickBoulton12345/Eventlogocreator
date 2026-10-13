import type { NextRequest } from "next/server";
import { sketchSvg } from "@/lib/sketch";

// GET /api/sketch?chapter=<chapter name>
// A flat drawing of the chapter's city (see lib/sketch.ts), as an SVG the
// card can use in place of a photo.

export function GET(req: NextRequest) {
  const chapter = req.nextUrl.searchParams.get("chapter")?.trim() ?? "";
  if (!chapter) {
    return Response.json({ error: "Missing chapter parameter" }, { status: 400 });
  }
  return new Response(sketchSvg(chapter), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
