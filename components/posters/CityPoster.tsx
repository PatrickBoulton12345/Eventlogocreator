import type { ReactNode } from "react";
import {
  formatDateForDisplay,
  formatTimeForDisplay,
  type EventType,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS } from "@/components/Motif";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, POSTER_WIDTH } from "./PosterFrame";
import { textWidth, wrapToWidth } from "@/lib/text-width";

// Every event card: a photo of the chapter's city filling the card, fading
// down into a dark tint of the event's colour, with the headline and the
// details in the lower half. Matches the "LFG wins" carousel slides.

const SIDE = 72;
const TEXT_WIDTH = POSTER_WIDTH - SIDE * 2;
const WHITE = "#FFFFFF";
const BODY_GREY = "#E4DCCB";

type Look = {
  // Highlight colour: the tag box and the second headline line.
  accent: string;
  // The colour the photo fades into at the very bottom of the card.
  base: string;
  // The event words in the headline, e.g. "at the pub".
  tail: (data: PostData) => string;
  // A short line after the date and venue.
  pitch: ReactNode;
};

const LOOKS: Record<EventType, Look> = {
  "pub-social": {
    accent: BRAND_COLORS.ORANGE,
    base: "#7A2C08",
    tail: () => "at the pub",
    pitch: (
      <>
        Come for a drink and meet the people pushing for growth.{" "}
        <Bold>Everyone&apos;s welcome.</Bold>
      </>
    ),
  },
  hackathon: {
    accent: BRAND_COLORS.YELLOW,
    base: "#6B4524",
    tail: () => "hackathon",
    pitch: (
      <>
        Bring a laptop and build something that fixes a real problem.{" "}
        <Bold>Everyone&apos;s welcome.</Bold>
      </>
    ),
  },
  "litter-pick": {
    accent: "#8DC63F",
    base: "#3E6626",
    tail: () => "litter pick",
    pitch: (
      <>
        Come and help clean up our streets. <Bold>Everyone&apos;s welcome.</Bold>
      </>
    ),
  },
  custom: {
    accent: BRAND_COLORS.BLUE,
    base: "#3B6763",
    tail: (data) => data.customEventLabel.trim().toLowerCase() || "your event",
    pitch: <Bold>Everyone&apos;s welcome.</Bold>,
  },
};

export function CityPoster({ data }: { data: PostData }) {
  const look = LOOKS[data.eventType];
  const place = placeName(data.chapter);
  const tail = look.tail(data);
  const headline = layoutHeadline(place, `${tail}.`);

  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);
  const when = [date, time].filter(Boolean).join(", ") || "date and time tbc";
  const { venue, area } = splitLocation(data.location);
  const signup = shortLink(data.signupUrl);

  return (
    <PosterFrame background="#1C1C1C" color={WHITE}>
      {data.photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.photoUrl}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}

      {/* The photo stays clear at the top, then darkens behind the words
          and settles into the event's colour at the bottom. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(to bottom,
            rgba(0,0,0,0.05) 0%,
            rgba(0,0,0,0.15) 22%,
            rgba(10,8,6,0.72) 45%,
            rgba(18,12,8,0.9) 62%,
            ${look.base} 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: SIDE,
          right: SIDE,
          bottom: 62,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            backgroundColor: look.accent,
            color: BRAND_COLORS.BLACK,
            fontFamily: "var(--font-body)",
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "12px 20px 10px",
            lineHeight: 1,
            marginBottom: 26,
          }}
        >
          {data.chapter.trim() || "your chapter"}
        </div>

        <div
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 700,
            fontSize: headline.size,
            letterSpacing: `${HEADLINE.letterSpacing}em`,
            lineHeight: HEADLINE.lineHeight,
            // Octarine's descenders hang low; keep them off the copy below.
            paddingBottom: Math.round(headline.size * 0.12),
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
            marginTop: 18,
          }}
        >
          <Bold>{when}</Bold> at <Bold>{venue || "venue tbc"}</Bold>
          {area ? `, ${area}` : ""}. {look.pitch}
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
            marginTop: 34,
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
  lineHeight: 0.92,
};

function layoutHeadline(
  place: string,
  tail: string,
): { size: number; placeLines: string[]; tailLines: string[] } {
  const { maxHeight, idealSize, minSize, letterSpacing, lineHeight } = HEADLINE;

  for (let size = idealSize; size >= minSize; size -= 2) {
    const placeLines = place ? wrapToWidth(place, TEXT_WIDTH, size, letterSpacing) : [];
    const tailLines = wrapToWidth(tail, TEXT_WIDTH, size, letterSpacing);
    const all = [...placeLines, ...tailLines];
    if (all.some((l) => textWidth(l, size, letterSpacing) > TEXT_WIDTH)) continue;
    if (all.length * lineHeight * size <= maxHeight) {
      return { size, placeLines, tailLines };
    }
  }

  return {
    size: minSize,
    placeLines: place ? wrapToWidth(place, TEXT_WIDTH, minSize, letterSpacing) : [],
    tailLines: wrapToWidth(tail, TEXT_WIDTH, minSize, letterSpacing),
  };
}
