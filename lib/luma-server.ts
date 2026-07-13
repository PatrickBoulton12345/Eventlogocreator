import type { LumaImported } from "@/lib/luma";

// Server-side helpers for reading event details from a Luma page.
// Shared by /api/luma (form autofill) and /api/card (automatic card image).

export const LUMA_HOSTS = new Set([
  "lu.ma",
  "www.lu.ma",
  "luma.com",
  "www.luma.com",
]);

export async function fetchLumaEvent(
  url: URL,
): Promise<{ event: LumaImported } | { error: string; status: number }> {
  if (!LUMA_HOSTS.has(url.hostname)) {
    return { error: "Only lu.ma or luma.com links are supported", status: 400 };
  }

  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LFGEventCreator/1.0; +https://github.com/PatrickBoulton12345/checker)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    return { error: `Luma returned an error (HTTP ${res.status})`, status: 502 };
  }

  const html = await res.text();
  const event = extractEvent(html, url.toString());

  if (!event) {
    return {
      error: "Couldn't read event details from that Luma page",
      status: 404,
    };
  }

  return { event };
}

export function extractEvent(
  html: string,
  fallbackUrl: string,
): LumaImported | null {
  const ldBlocks = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];

  for (const block of ldBlocks) {
    try {
      const parsed = JSON.parse(block[1]);
      const event = findEvent(parsed);
      if (event) {
        return extractFromEvent(event, fallbackUrl);
      }
    } catch {
      // Move on to the next block
    }
  }

  const og = extractOpenGraph(html);
  if (og.name || og.startDate) {
    const dt = parseDateTime(og.startDate);
    return {
      name: og.name,
      date: dt.date,
      time: dt.time,
      location: "",
      signupUrl: og.url || fallbackUrl,
    };
  }

  return null;
}

function findEvent(json: unknown): Record<string, unknown> | null {
  if (!json || typeof json !== "object") return null;
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findEvent(item);
      if (found) return found;
    }
    return null;
  }
  const obj = json as Record<string, unknown>;
  const type = obj["@type"];
  if (type === "Event" || (Array.isArray(type) && type.includes("Event"))) {
    return obj;
  }
  if (obj["@graph"]) return findEvent(obj["@graph"]);
  return null;
}

function extractFromEvent(
  event: Record<string, unknown>,
  fallbackUrl: string,
): LumaImported {
  const startDate =
    typeof event.startDate === "string" ? event.startDate : "";
  const dt = parseDateTime(startDate);
  return {
    name: typeof event.name === "string" ? event.name.trim() : "",
    date: dt.date,
    time: dt.time,
    location: formatLocation(event.location),
    signupUrl:
      typeof event.url === "string" && event.url.trim()
        ? event.url.trim()
        : fallbackUrl,
  };
}

function formatLocation(loc: unknown): string {
  if (!loc) return "";
  if (typeof loc === "string") return loc.trim();
  if (Array.isArray(loc) && loc[0]) return formatLocation(loc[0]);
  if (typeof loc !== "object") return "";

  const obj = loc as Record<string, unknown>;
  const name = typeof obj.name === "string" ? obj.name.trim() : "";
  const addressStr = formatAddress(obj.address);

  return joinUnique([name, addressStr]);
}

function formatAddress(address: unknown): string {
  if (!address) return "";
  if (typeof address === "string") return address.trim();
  if (typeof address !== "object" || Array.isArray(address)) return "";
  const a = address as Record<string, unknown>;
  const parts = [
    a.streetAddress,
    a.addressLocality,
    a.addressRegion,
    a.postalCode,
  ]
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => v.trim());
  return joinUnique(parts);
}

function joinUnique(items: string[]): string {
  const flat = items
    .flatMap((s) => s.split(",").map((p) => p.trim()))
    .filter(Boolean);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of flat) {
    const key = part.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(part);
  }
  return out.join(", ");
}

function parseDateTime(iso: string): { date: string; time: string } {
  if (!iso) return { date: "", time: "" };
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return { date: "", time: "" };
  return {
    date: `${m[1]}-${m[2]}-${m[3]}`,
    time: `${m[4]}:${m[5]}`,
  };
}

function extractOpenGraph(html: string) {
  const meta = (prop: string): string => {
    const re = new RegExp(
      `<meta\\s+(?:property|name)=["']${prop}["']\\s+content=["']([^"']+)["']`,
      "i",
    );
    const m = html.match(re);
    return m ? decodeEntities(m[1]) : "";
  };
  return {
    name: meta("og:title") || meta("twitter:title"),
    startDate: "",
    url: meta("og:url"),
  };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');
}
