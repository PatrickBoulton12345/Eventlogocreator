import type { LumaImported } from "@/lib/luma";
import { EMPTY_POST, type EventType, type PostData } from "@/lib/types";
import { findChapterName, findChapterSocials } from "@/lib/chapters";

// Turns imported Luma details into a complete card, guessing the event
// type and chapter from the event name (e.g. "Edinburgh Social" →
// pub-social, chapter "LFG Edinburgh"). Used by /api/card.

function inferEventType(name: string): { type: EventType; label: string } {
  const lower = name.toLowerCase();
  if (/\blitter\b/.test(lower)) return { type: "litter-pick", label: "" };
  if (/\bhackathon\b|\bhack\s*(day|night)\b/.test(lower))
    return { type: "hackathon", label: "" };
  if (/\bsocial\b|\bpub\b|\bdrinks\b|\bmeet\s*up\b|\bmeetup\b/.test(lower))
    return { type: "pub-social", label: "" };
  // "LFG" is already on the card twice; drop it from the big headline.
  const label = name
    .replace(/\blfg\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return { type: "custom", label: label || name.toLowerCase() };
}

function inferChapter(name: string, type: EventType): string {
  // Strip the event-type words off the name; what's left is usually the
  // chapter, e.g. "West Mids Social" → "West Mids".
  let rest = name
    .replace(/\b(pub\s+)?social\b/gi, "")
    .replace(/\blitter\s*pick\b/gi, "")
    .replace(/\bhackathon\b/gi, "")
    .replace(/\bmeet\s*up\b|\bmeetup\b/gi, "")
    .replace(/\bdrinks\b/gi, "")
    .replace(/\blfg\b/gi, "")
    .replace(/[|•·:\-–—]+\s*$/g, "")
    .replace(/^\s*[|•·:\-–—]+/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!rest && type === "custom") return "LFG";
  if (!rest) return "LFG";
  return `LFG ${rest}`;
}

function normaliseLocation(location: string): string {
  if (!location.trim() || /^tbc$/i.test(location.trim())) {
    return "venue tbc";
  }
  return location;
}

export function buildCardData(imported: LumaImported): PostData {
  const { type, label } = inferEventType(imported.name || "");

  // For custom events (e.g. "LFG Summer Party") the whole name is the
  // headline, so only claim a chapter if the name mentions a known one.
  // Prefer the official chapter name when the event name mentions one
  // (e.g. "LFG Westminster: Monthly Pub Social" → "LFG Westminster").
  const known = findChapterName(imported.name || "");
  let chapter: string;
  if (known) {
    chapter = `LFG ${known}`;
  } else if (type === "custom") {
    chapter = "LFG";
  } else {
    chapter = inferChapter(imported.name || "", type);
  }
  const socials = findChapterSocials(chapter);

  return {
    ...EMPTY_POST,
    eventType: type,
    customEventLabel: label,
    chapter,
    // Some Luma pages only reveal the venue after signing up, or the
    // organiser has literally typed "tbc" as the location.
    location: normaliseLocation(imported.location),
    date: imported.date,
    time: imported.time,
    signupUrl: imported.signupUrl,
    email: "",
    socials: {
      ...EMPTY_POST.socials,
      instagram: socials?.instagram ?? "",
      twitter: socials?.twitter ?? "",
    },
  };
}
