// Reads the LFG public Luma calendar and returns its upcoming events.
// The calendar page embeds a JSON-LD ItemList of every upcoming event
// (name, start date/time, link), so one fetch gets the whole list.

export const LFG_CALENDAR_URL = "https://luma.com/lookingforgrowth";

export type CalendarEvent = {
  name: string;
  startDate: string; // ISO, e.g. 2026-07-21T18:00:00.000+01:00
  date: string; // YYYY-MM-DD
  url: string;
};

export async function fetchCalendarEvents(
  calendarUrl: string = LFG_CALENDAR_URL,
): Promise<CalendarEvent[]> {
  const res = await fetch(calendarUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LFGEventCreator/1.0; +https://github.com/PatrickBoulton12345/checker)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Calendar returned HTTP ${res.status}`);
  }
  const html = await res.text();
  return parseCalendar(html);
}

export function parseCalendar(html: string): CalendarEvent[] {
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];

  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1]);
    } catch {
      continue;
    }
    const list = findItemList(parsed);
    if (list) return list;
  }
  return [];
}

function findItemList(json: unknown): CalendarEvent[] | null {
  if (!json || typeof json !== "object") return null;
  if (Array.isArray(json)) {
    for (const item of json) {
      const found = findItemList(item);
      if (found) return found;
    }
    return null;
  }
  const obj = json as Record<string, unknown>;
  if (obj["@type"] === "ItemList" && Array.isArray(obj.itemListElement)) {
    const out: CalendarEvent[] = [];
    for (const entry of obj.itemListElement as Record<string, unknown>[]) {
      const ev = entry.item as Record<string, unknown> | undefined;
      if (!ev) continue;
      const name = typeof ev.name === "string" ? ev.name.trim() : "";
      const startDate = typeof ev.startDate === "string" ? ev.startDate : "";
      const url = typeof ev.url === "string" ? ev.url : "";
      if (!name || !url) continue;
      out.push({ name, startDate, date: startDate.slice(0, 10), url });
    }
    return out;
  }
  if (obj["@graph"]) return findItemList(obj["@graph"]);
  return null;
}

// Events whose date falls between today and `days` days from now
// (inclusive). `today` is a YYYY-MM-DD string so callers control the clock.
export function filterWithinDays(
  events: CalendarEvent[],
  today: string,
  days: number,
): CalendarEvent[] {
  const start = new Date(`${today}T00:00:00Z`).getTime();
  const end = start + days * 24 * 60 * 60 * 1000;
  return events
    .filter((e) => {
      if (!e.date) return false;
      const t = new Date(`${e.date}T00:00:00Z`).getTime();
      return t >= start && t <= end;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}
