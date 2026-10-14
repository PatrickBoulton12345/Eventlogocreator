import type { CSSProperties, ReactNode } from "react";
import {
  formatDateForDisplay,
  formatTimeForDisplay,
  PHOTO_ZOOM_MAX,
  type EventType,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS } from "@/components/Motif";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, POSTER_HEIGHT, POSTER_WIDTH } from "./PosterFrame";
import { textWidth, wrapToWidth } from "@/lib/text-width";
import { SKETCH_GROUND } from "@/lib/sketch";

// Every event card: a photo of the chapter's city filling the card (or the
// event's colour when there's no photo), with the headline and the details
// in the lower half. Matches the "LFG wins" carousel slides.

const SIDE = 72;
const TEXT_WIDTH = POSTER_WIDTH - SIDE * 2;
// The words sit between here and the bottom of the card: clear of a city
// sketch's skyline, and leaving the top of a photo showing.
const TEXT_TOP = SKETCH_GROUND + 40;
const TEXT_BOTTOM = 48;
const WHITE = "#FFFFFF";
const BODY_GREY = "#E4DCCB";

type Look = {
  // Highlight colour: the second headline line and the sign-up link.
  accent: string;
  // The card's background when there's no photo.
  base: string;
  // The event words in the headline, e.g. "at the pub".
  tail: (data: PostData) => string;
  // A short line after the date and venue, ending in a bold phrase.
  pitch: { lead: string; bold: string };
};

const LOOKS: Record<EventType, Look> = {
  "pub-social": {
    accent: BRAND_COLORS.ORANGE,
    base: "#7A2C08",
    tail: () => "at the pub",
    pitch: { lead: "Come for a drink and meet the people pushing for growth.", bold: "Everyone's welcome." },
  },
  hackathon: {
    accent: BRAND_COLORS.YELLOW,
    base: "#6B4524",
    tail: () => "hackathon",
    pitch: { lead: "Bring a laptop and build something that fixes a real problem.", bold: "Everyone's welcome." },
  },
  "litter-pick": {
    accent: "#8DC63F",
    base: "#3E6626",
    tail: () => "litter pick",
    pitch: { lead: "Come and help clean up our streets.", bold: "Everyone's welcome." },
  },
  custom: {
    accent: BRAND_COLORS.BLUE,
    base: "#3B6763",
    tail: (data) => data.customEventLabel.trim().toLowerCase() || "your event",
    pitch: { lead: "", bold: "Everyone's welcome." },
  },
};

export function CityPoster({ data }: { data: PostData }) {
  const look = LOOKS[data.eventType];
  const place = placeName(data.chapter);
  const tail = look.tail(data);

  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);
  const when = [date, time].filter(Boolean).join(", ") || "date and time tbc";
  const { venue, area } = splitLocation(data.location);
  const signup = shortLink(data.signupUrl);
  const details = `${when} at ${venue || "venue tbc"}${area ? `, ${area}` : ""}. ${look.pitch.lead} ${look.pitch.bold}`;

  // The headline gets whatever room is left above the details.
  const socialCount = Object.values(data.socials).filter((h) => h?.trim()).length;
  const footer = Math.max(44, socialCount * 28 + Math.max(0, socialCount - 1) * 12);
  const below = TEXT_BOTTOM + footer + FOOTER_GAP + detailsHeight(details, !!signup, !!data.email) + DETAILS_GAP;
  const headline = layoutHeadline(place, `${tail}.`, POSTER_HEIGHT - below - TEXT_TOP);

  return (
    <PosterFrame background={look.base} color={WHITE}>
      {data.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.photoUrl}
          alt=""
          data-poster-photo=""
          style={photoStyle(data)}
        />
      )}

      <div
        style={{
          position: "absolute",
          left: SIDE,
          right: SIDE,
          bottom: TEXT_BOTTOM,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          // Keeps the words readable over a bright photo.
          textShadow: data.photoUrl
            ? "0 2px 6px rgba(0,0,0,0.55), 0 0 28px rgba(0,0,0,0.45)"
            : undefined,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 700,
            fontSize: headline.size,
            letterSpacing: `${HEADLINE.letterSpacing}em`,
            lineHeight: HEADLINE.lineHeight,
            // Octarine's descenders hang low; keep them off the copy below.
            paddingBottom: Math.round(headline.size * HEADLINE.descent),
          }}
        >
          {headline.placeLines.map((line, i) => (
            <div key={`p${i}`} style={{ color: WHITE }}>
              {line}
            </div>
          ))}
          {headline.tailLines.map((line, i) => (
            <div key={`t${i}`} style={{ color: look.accent }}>
              {line}
            </div>
          ))}
        </div>

        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: 31,
            lineHeight: 1.32,
            color: BODY_GREY,
            letterSpacing: "-0.01em",
            marginTop: DETAILS_GAP,
          }}
        >
          <Bold>{when}</Bold> at <Bold>{venue || "venue tbc"}</Bold>
          {area ? `, ${area}` : ""}. {look.pitch.lead}
          {look.pitch.lead ? " " : ""}
          <Bold>{look.pitch.bold}</Bold>
          {signup && (
            <div style={{ marginTop: 14 }}>
              Sign up: <span style={{ color: look.accent, fontWeight: 700 }}>{signup}</span>
            </div>
          )}
          {data.email && (
            <div style={{ marginTop: 6, fontSize: 25, opacity: 0.85 }}>{data.email}</div>
          )}
        </div>

        <div
          style={{
            marginTop: FOOTER_GAP,
            width: "100%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 44,
              letterSpacing: "-0.03em",
              lineHeight: 1,
              color: BRAND_COLORS.ORANGE,
            }}
          >
            lookingforgrowth
          </div>
          <SocialIcons socials={data.socials} color={BODY_GREY} size={28} fontSize={19} />
        </div>
      </div>

      {data.photoUrl && data.photoCredit && (
        <div
          style={{
            position: "absolute",
            right: SIDE,
            bottom: 24,
            left: SIDE,
            textAlign: "right",
            fontFamily: "var(--font-body)",
            fontSize: 12,
            color: BODY_GREY,
            opacity: 0.55,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.photoCredit}
        </div>
      )}

      <ColourStrip />
    </PosterFrame>
  );
}

// The photo always covers the card. Zooming scales it up around the
// chosen point, and moving slides which part of it shows.
function photoStyle(data: PostData): CSSProperties {
  const x = clamp(data.photoX ?? 50, 0, 100);
  const y = clamp(data.photoY ?? 50, 0, 100);
  const zoom = clamp(data.photoZoom ?? 1, 1, PHOTO_ZOOM_MAX);
  return {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: `${x}% ${y}%`,
    transform: zoom > 1 ? `scale(${zoom})` : undefined,
    transformOrigin: `${x}% ${y}%`,
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
}

function Bold({ children }: { children: ReactNode }) {
  return <span style={{ fontWeight: 700, color: WHITE }}>{children}</span>;
}

// The four brand colours along the bottom edge, as on the carousel slides.
function ColourStrip() {
  const colours = [
    BRAND_COLORS.YELLOW,
    BRAND_COLORS.ORANGE,
    BRAND_COLORS.BLUE,
    BRAND_COLORS.CREAM,
  ];
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 16,
        display: "flex",
      }}
    >
      {colours.map((c) => (
        <div key={c} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </div>
  );
}

// "LFG Edinburgh" → "edinburgh"; a bare "LFG" (no chapter) leaves the
// headline to the event words alone.
function placeName(chapter: string): string {
  const trimmed = (chapter || "").trim();
  if (!trimmed) return "your chapter";
  return trimmed.replace(/^lfg\b\s*/i, "").trim().toLowerCase();
}

// "Teuchters, Edinburgh, Scotland" → venue "Teuchters", area "Edinburgh".
function splitLocation(location: string): { venue: string; area: string } {
  const parts = (location || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return { venue: "", area: "" };
  // The town is enough; postcodes and countries just add clutter.
  const area = parts
    .slice(1)
    .filter((p) => !/\d/.test(p) && !/^(uk|united kingdom|england|scotland|wales)$/i.test(p))
    .slice(0, 1)
    .join("");
  return { venue: parts[0], area };
}

function shortLink(url: string): string {
  return (url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

// The place and the event words share one size: as big as possible while
// every line fits the width and the whole headline stays short enough to
// leave the photo showing above it. Measured from the real font so a wide
// name like "Cambridge" can't run off the edge.
const HEADLINE = {
  maxHeight: 400,
  idealSize: 150,
  minSize: 56,
  letterSpacing: -0.04,
  // Enough room that one line's descenders ("y", "g", "p") clear the
  // next line's tall letters.
  lineHeight: 1.02,
  // Space left under the last line for its descenders.
  descent: 0.14,
};

const DETAILS_GAP = 18;
const FOOTER_GAP = 30;

// Roughly how tall the date, venue and sign-up text will be, so the
// headline can be sized to fit above it. At 31px a line holds about 54
// characters; this errs on the side of an extra line.
function detailsHeight(text: string, signup: boolean, email: boolean): number {
  const lines = Math.ceil(text.length / 54);
  return lines * 31 * 1.32 + (signup ? 14 + 41 : 0) + (email ? 6 + 33 : 0);
}

function layoutHeadline(
  place: string,
  tail: string,
  room: number,
): { size: number; placeLines: string[]; tailLines: string[] } {
  const { idealSize, minSize, letterSpacing, lineHeight, descent } = HEADLINE;
  const maxHeight = Math.min(HEADLINE.maxHeight, room);

  for (let size = idealSize; size >= minSize; size -= 2) {
    const placeLines = place ? wrapToWidth(place, TEXT_WIDTH, size, letterSpacing) : [];
    const tailLines = wrapToWidth(tail, TEXT_WIDTH, size, letterSpacing);
    const all = [...placeLines, ...tailLines];
    if (all.some((l) => textWidth(l, size, letterSpacing) > TEXT_WIDTH)) continue;
    if ((all.length * lineHeight + descent) * size <= maxHeight) {
      return { size, placeLines, tailLines };
    }
  }

  return {
    size: minSize,
    placeLines: place ? wrapToWidth(place, TEXT_WIDTH, minSize, letterSpacing) : [],
    tailLines: wrapToWidth(tail, TEXT_WIDTH, minSize, letterSpacing),
  };
}
