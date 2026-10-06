import type { NextRequest } from "next/server";
import { isAllowedHost } from "@/lib/photos";

// GET /api/photo?src=<photo address>
// Passes a city photo through our own site, so the card's download
// button (which can only copy pictures from the same site) and the
// headless renderer behind /api/card can both draw it. Only the photo
// libraries in lib/photos.ts are allowed.

export const runtime = "nodejs";
export const maxDuration = 30;

const UA =
  "LFGEventCreator/1.0 (+https://eventlogocreator.vercel.app; patrick@lookingforgrowth.uk)";

export async function GET(req: NextRequest) {
  const src = req.nextUrl.searchParams.get("src") ?? "";
  if (!isAllowedHost(src)) {
    return Response.json({ error: "Photo address not allowed" }, { status: 400 });
  }

  // Try the resized copy, then the original if the copy isn't available.
  // Wikimedia briefly turns away bursts of requests, so each gets a retry.
  let res: Response | null = null;
  for (const url of [src, originalOf(src)].filter(Boolean) as string[]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      res = await fetch(url, { headers: { "User-Agent": UA } }).catch(() => null);
      if (res?.status !== 429) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
    if (res?.ok) break;
  }
  const type = res?.headers.get("content-type") ?? "";
  if (!res?.ok || !type.startsWith("image/")) {
    return Response.json({ error: "Couldn't fetch the photo" }, { status: 502 });
  }

  return new Response(await res.arrayBuffer(), {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=604800, s-maxage=604800",
    },
  });
}

// ".../commons/thumb/a/ab/Name.jpg/1920px-Name.jpg" → ".../commons/a/ab/Name.jpg"
function originalOf(src: string): string | null {
  const m = src.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/thumb\/(\w\/\w\w\/[^/]+)\/[^/]+$/);
  return m ? `${m[1]}/${m[2]}` : null;
}
