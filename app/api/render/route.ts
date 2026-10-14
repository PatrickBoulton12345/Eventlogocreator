import type { NextRequest } from "next/server";
import { launchBrowser, renderCardJpeg, type CardPhoto } from "@/lib/render";
import { buildExportFilename, EMPTY_POST, type PostData } from "@/lib/types";

// POST /api/render with the card's details as JSON
// Draws the card in a headless browser and returns the 1080×1350 JPEG.
// The download button uses this so the card comes out the same whatever
// browser the organiser is on (Safari's own drawing loses the fonts, the
// photo and the colours). The photo comes along as a data: URL, so the
// renderer never has to fetch it again; otherwise only our own
// /api/photo and /api/sketch addresses are allowed.

export const runtime = "nodejs";
export const maxDuration = 60;

// Just under the hosting platform's request size limit.
const MAX_BODY = 4_200_000;

export async function POST(req: NextRequest) {
  const body = await req.text();
  if (body.length > MAX_BODY) {
    return Response.json({ error: "The photo is too large to send" }, { status: 413 });
  }

  let parsed: Partial<PostData>;
  try {
    parsed = JSON.parse(body) as Partial<PostData>;
  } catch {
    return Response.json({ error: "Expected the card's details as JSON" }, { status: 400 });
  }
  const data: PostData = {
    ...EMPTY_POST,
    ...parsed,
    socials: { ...EMPTY_POST.socials, ...(parsed.socials ?? {}) },
  };

  let photo: CardPhoto | undefined;
  const inline = data.photoUrl?.match(/^data:(image\/[\w+.-]+);base64,([A-Za-z0-9+/=]+)$/);
  if (inline) {
    photo = { type: inline[1], body: Buffer.from(inline[2], "base64") };
  } else if (data.photoUrl && !/^\/api\/(photo|sketch)\?/.test(data.photoUrl)) {
    data.photoUrl = "";
  }

  let browser;
  try {
    browser = await launchBrowser();
    const jpeg = await renderCardJpeg(browser, data, req.nextUrl.origin, photo);
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${buildExportFilename(data)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Render error:", err);
    return Response.json({ error: "Failed to render the card image" }, { status: 500 });
  } finally {
    await browser?.close().catch(() => {});
  }
}
