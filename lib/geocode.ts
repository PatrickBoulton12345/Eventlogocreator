// Turns a written address into map coordinates using OpenStreetMap's
// Nominatim service (no account or API key needed). Cards made from a
// Luma link already carry the venue pin, so this is for addresses typed
// in by hand, and as a backstop when Luma doesn't publish one.

import type { PostData } from "@/lib/types";

const UA =
  "LFGEventCreator/1.0 (+https://eventlogocreator.vercel.app; patrick@lookingforgrowth.uk)";

// Remembers lookups for the life of the server process, so a batch of
// cards for the same venue only asks Nominatim once.
const cache = new Map<string, Coords | null>();

export type Coords = { lat: number; lng: number };

export function isCoord(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180 &&
    !(lat === 0 && lng === 0)
  );
}

// True for locations that aren't really an address yet, e.g. "venue tbc".
export function isPlaceholderLocation(location: string): boolean {
  const trimmed = (location || "").trim();
  return !trimmed || /^(venue\s+)?tbc$/i.test(trimmed);
}

export async function geocode(q: string): Promise<Coords | null> {
  const key = q.trim().toLowerCase();
  if (!key || isPlaceholderLocation(key)) return null;
  if (cache.has(key)) return cache.get(key) ?? null;

  let result: Coords | null = null;
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "gb");
    url.searchParams.set("q", q);
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const json = (await res.json()) as { lat?: string; lon?: string }[];
      const lat = Number(json[0]?.lat);
      const lng = Number(json[0]?.lon);
      if (isCoord(lat, lng)) result = { lat, lng };
    }
  } catch {
    result = null;
  }

  cache.set(key, result);
  return result;
}

// Drops the leading venue name and tries again, e.g. a pub OSM hasn't
// heard of still lands on the right street or town.
export async function geocodeLocation(location: string): Promise<Coords | null> {
  const direct = await geocode(location);
  if (direct) return direct;

  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return geocode(parts.slice(1).join(", "));
  }
  return null;
}

// Fills in the venue pin for a card that doesn't have one yet, so the
// poster only ever draws the map when there's really something to show.
export async function ensureVenuePin(data: PostData): Promise<PostData> {
  if (isCoord(Number(data.lat), Number(data.lng))) return data;
  if (isPlaceholderLocation(data.location)) return data;
  const found = await geocodeLocation(data.location);
  return found ? { ...data, lat: found.lat, lng: found.lng } : data;
}
