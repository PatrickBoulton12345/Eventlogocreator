import type { NextRequest } from "next/server";
import { geocodeLocation, isCoord } from "@/lib/geocode";

// GET /api/map?lat=55.94&lng=-3.21&w=920&h=270&zoom=16
// GET /api/map?q=Teuchters, Edinburgh&w=920&h=270
//
// Returns a small map picture of the venue, drawn as an SVG that has the
// OpenStreetMap map tiles embedded inside it, with an LFG-orange pin in
// the middle. It comes from our own site (rather than the poster loading
// an outside image), so both ways of making a card work: the headless
// browser behind /api/card, and the download button in the browser.
//
// OpenStreetMap needs no account or API key. If the user ever wants
// Google's own map styling instead, that needs a Google Maps API key and
// only the tile fetching below would change.

export const runtime = "nodejs";
export const maxDuration = 30;

const TILE_SIZE = 256;
const UA =
  "LFGEventCreator/1.0 (+https://eventlogocreator.vercel.app; patrick@lookingforgrowth.uk)";
const ORANGE = "#FE5500";
const CREAM = "#EBE3D0";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const width = clamp(Number(p.get("w")) || 920, 100, 1200);
  const height = clamp(Number(p.get("h")) || 270, 80, 800);
  const zoom = clamp(Number(p.get("zoom")) || 16, 3, 18);

  let lat = Number(p.get("lat"));
  let lng = Number(p.get("lng"));

  if (!isCoord(lat, lng)) {
    const q = p.get("q")?.trim();
    const found = q ? await geocodeLocation(q) : null;
    if (!found) {
      return svgResponse(blankMap(width, height), 60 * 60);
    }
    lat = found.lat;
    lng = found.lng;
  }

  const svg = await buildMapSvg(lat, lng, zoom, width, height);
  return svgResponse(svg, 60 * 60 * 24 * 7);
}

function svgResponse(svg: string, maxAge: number): Response {
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}

async function buildMapSvg(
  lat: number,
  lng: number,
  zoom: number,
  width: number,
  height: number,
): Promise<string> {
  // Where the venue sits on the whole world map, in pixels, at this zoom.
  const centreX = lngToPixel(lng, zoom);
  const centreY = latToPixel(lat, zoom);
  const left = centreX - width / 2;
  const top = centreY - height / 2;

  const firstTileX = Math.floor(left / TILE_SIZE);
  const lastTileX = Math.floor((left + width - 1) / TILE_SIZE);
  const firstTileY = Math.floor(top / TILE_SIZE);
  const lastTileY = Math.floor((top + height - 1) / TILE_SIZE);

  // Each tile we need, with where it belongs inside the picture.
  const wanted: { tileX: number; tileY: number; x: number; y: number }[] = [];
  const tileCount = 2 ** zoom;
  for (let ty = firstTileY; ty <= lastTileY; ty++) {
    if (ty < 0 || ty >= tileCount) continue;
    for (let tx = firstTileX; tx <= lastTileX; tx++) {
      wanted.push({
        tileX: ((tx % tileCount) + tileCount) % tileCount,
        tileY: ty,
        x: Math.round(tx * TILE_SIZE - left),
        y: Math.round(ty * TILE_SIZE - top),
      });
    }
  }

  const tiles = await Promise.all(
    wanted.map(async (t) => {
      const data = await fetchTile(zoom, t.tileX, t.tileY);
      return data ? { data, x: t.x, y: t.y } : null;
    }),
  );

  const images = tiles
    .filter((t): t is NonNullable<typeof t> => t !== null)
    .map(
      (t) =>
        `<image x="${t.x}" y="${t.y}" width="${TILE_SIZE}" height="${TILE_SIZE}" ` +
        `href="data:image/png;base64,${t.data}" />`,
    )
    .join("");

  const pinX = Math.round(width / 2);
  const pinY = Math.round(height / 2);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${CREAM}" />
${images}
${pin(pinX, pinY)}
<text x="${width - 8}" y="${height - 8}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="13" fill="#333" opacity="0.75">© OpenStreetMap</text>
</svg>`;
}

// A round-headed pin in LFG orange, outlined in black so it reads on any
// part of the map.
function pin(x: number, y: number): string {
  const r = 15;
  const tip = 26;
  return `<g>
<path d="M ${x - r} ${y - tip} L ${x + r} ${y - tip} L ${x} ${y} Z" fill="#000" />
<circle cx="${x}" cy="${y - tip - r * 0.9}" r="${r + 4}" fill="#000" />
<circle cx="${x}" cy="${y - tip - r * 0.9}" r="${r}" fill="${ORANGE}" />
<circle cx="${x}" cy="${y - tip - r * 0.9}" r="${r * 0.32}" fill="#000" />
</g>`;
}

function blankMap(width: number, height: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<rect width="${width}" height="${height}" fill="${CREAM}" />
</svg>`;
}

async function fetchTile(
  z: number,
  x: number,
  y: number,
): Promise<string | null> {
  try {
    const res = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {
      headers: { "User-Agent": UA, Accept: "image/png" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.toString("base64");
  } catch {
    return null;
  }
}

function lngToPixel(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * TILE_SIZE * 2 ** zoom;
}

function latToPixel(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  const y =
    (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2;
  return y * TILE_SIZE * 2 ** zoom;
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
