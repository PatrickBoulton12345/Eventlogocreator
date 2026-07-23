import type { CalendarEvent } from "@/lib/calendar";
import { chipChapter, deriveChapter } from "@/lib/roundup";

// Builds the Instagram caption for an event, matching the house style:
// beer-emoji opener, one "done with decline, get Britain growing" line,
// the sign-up CTA, then the fixed hashtags.

const MISSION_LINES = [
  "Come meet the people who are done with decline and want to get Britain building and growing again.",
  "Come and meet the people who've had enough of Britain's decline and want to start growing again.",
  "Come along to meet others who are done with decline and ready to get Britain growing.",
  "A relaxed evening with people who want to reverse Britain's decline and get it growing again.",
  "Come for good company with people who are done with decline and ready to build a growing Britain.",
  "Come meet the people who refuse to accept Britain's decline and want to start growing again.",
  "Come and meet others who are done with decline and want to get Britain growing again.",
  "Come along to meet people who've had enough of decline and want to get Britain growing.",
  "Come for a pint with people who are done with Britain's decline and ready to get it growing again.",
  "Come meet the people who want to reverse the decline and get Britain growing again.",
];

// Stable per-event pick so a given event always gets the same line.
function pickMission(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return MISSION_LINES[hash % MISSION_LINES.length];
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function longDate(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return ymd;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}

export function buildCaption(ev: CalendarEvent): string {
  const lower = ev.name.toLowerCase();
  const when = longDate(ev.date);

  let opener: string;
  if (/\bparty\b/.test(lower)) {
    // National/one-off, e.g. "LFG Summer Party"
    opener = `🍺 LFG is hosting a ${deriveChapter(ev.name)} on ${when}.`;
  } else {
    const chapter = titleCase(chipChapter(ev.name)) || "";
    opener = chapter
      ? `🍺 LFG ${chapter} is hosting a pub social on ${when}.`
      : `🍺 LFG is hosting a pub social on ${when}.`;
  }

  const mission = pickMission(ev.url || ev.name);
  const cta = `Sign up at ${ev.url}.`;
  const hashtags = "#events #uk #ukevents #growth";

  return [opener, mission, cta, hashtags].join("\n\n");
}
