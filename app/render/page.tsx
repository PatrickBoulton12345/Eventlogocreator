import { Poster } from "@/components/Poster";
import { EMPTY_POST, type PostData } from "@/lib/types";

// Bare full-size poster page used by /api/card, which opens it in a
// headless browser and screenshots the 1080×1350 card. The card data
// arrives base64-encoded in the `d` query parameter.

export const dynamic = "force-dynamic";

function decodeData(d: string | undefined): PostData {
  if (!d) return EMPTY_POST;
  try {
    const json = Buffer.from(d, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as Partial<PostData>;
    return {
      ...EMPTY_POST,
      ...parsed,
      socials: { ...EMPTY_POST.socials, ...(parsed.socials ?? {}) },
    };
  } catch {
    return EMPTY_POST;
  }
}

export default async function RenderPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const data = decodeData(d);

  return (
    <div
      id="poster-root"
      style={{ position: "fixed", top: 0, left: 0, width: 1080, height: 1350 }}
    >
      <Poster data={data} />
    </div>
  );
}
