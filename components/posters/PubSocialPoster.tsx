import {
  formatDateForDisplay,
  formatTimeForDisplay,
  formatWhen,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS } from "@/components/Motif";
import { LfgWordmark } from "@/components/Wordmark";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, splitWords } from "./PosterFrame";

const MAP_WIDTH = 920;
const MAP_HEIGHT = 290;

export function PubSocialPoster({ data }: { data: PostData }) {
  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);

  // Headline reads "<chapter> at the pub" — the chapter already carries
  // the LFG prefix elsewhere on the card, so drop it from the big type.
  const place = placeName(data.chapter);
  const lines = splitWords(place);
  const headlineSize = fitHeadline(lines, "at the pub", 920, 320, 190);

  const { venue, area } = splitLocation(data.location);
  const mapSrc = buildMapSrc(data);
  // With no map to sit above, the details block drops down the card so
  // the space below the headline doesn't read as a gap.
  const detailsTop = mapSrc ? 565 : 700;

  return (
    <PosterFrame background={BRAND_COLORS.ORANGE} color={BRAND_COLORS.BLACK}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 32,
          backgroundColor: BRAND_COLORS.BLACK,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 32,
          left: 0,
          right: 0,
          height: 18,
          backgroundColor: BRAND_COLORS.CREAM,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: 46,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: BRAND_COLORS.BLACK,
            lineHeight: 1,
          }}
        >
          {data.chapter || "your chapter"}
        </div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: BRAND_COLORS.BLACK,
            textTransform: "uppercase",
            paddingTop: 12,
            opacity: 0.7,
          }}
        >
          chapter event
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 235,
          left: 80,
          right: 80,
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          fontSize: headlineSize,
          lineHeight: 0.9,
        }}
      >
        {lines.map((w) => (
          <div key={w} style={{ color: BRAND_COLORS.BLACK }}>
            {w}
          </div>
        ))}
        <div
          style={{
            color: BRAND_COLORS.CREAM,
            fontSize: Math.round(headlineSize * 0.5),
            lineHeight: 1,
            marginTop: Math.round(headlineSize * 0.06),
          }}
        >
          at the pub
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: detailsTop,
          left: 80,
          width: MAP_WIDTH,
          height: 280,
          boxSizing: "border-box",
          backgroundColor: BRAND_COLORS.CREAM,
          padding: "36px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Row label="when" value={formatWhen(date, time)} />

        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <Label>where</Label>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 700,
                fontSize: fitVenue(venue),
                color: BRAND_COLORS.BLACK,
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              {venue || "your location"}
            </div>
            {area && (
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: 26,
                  color: BRAND_COLORS.BLACK,
                  opacity: 0.75,
                  marginTop: 8,
                  lineHeight: 1.15,
                }}
              >
                {area}
              </div>
            )}
          </div>
        </div>

        {data.signupUrl && <Row label="sign up" value={data.signupUrl} smallValue />}
      </div>

      {mapSrc && (
        <div
          style={{
            position: "absolute",
            top: 875,
            left: 80,
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            overflow: "hidden",
            border: `6px solid ${BRAND_COLORS.BLACK}`,
            boxSizing: "border-box",
            backgroundColor: BRAND_COLORS.CREAM,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mapSrc}
            alt=""
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            style={{ display: "block", width: "100%", height: "100%" }}
          />
        </div>
      )}

      <Footer data={data} />
    </PosterFrame>
  );
}

// "LFG Edinburgh" → "Edinburgh"; a bare "LFG" (unknown chapter) stays put.
function placeName(chapter: string): string {
  const trimmed = (chapter || "").trim();
  if (!trimmed) return "your chapter";
  const withoutPrefix = trimmed.replace(/^lfg\s+/i, "").trim();
  return withoutPrefix || trimmed;
}

// Splits "Teuchters, Edinburgh, Scotland" into the venue and the rest, so
// the pub name can be the big line and the area a quieter one beneath.
function splitLocation(location: string): { venue: string; area: string } {
  const trimmed = (location || "").trim();
  if (!trimmed) return { venue: "", area: "" };
  const parts = trimmed.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return { venue: trimmed, area: "" };
  return { venue: parts[0], area: parts.slice(1).join(", ") };
}

// Big enough to dominate the block, small enough to stay on one line.
function fitVenue(venue: string): number {
  const chars = Math.max(venue.length, 1);
  return Math.max(30, Math.min(58, Math.floor(700 / (chars * 0.5))));
}

// Shrinks the headline until the stacked chapter words plus the smaller
// "at the pub" line fit the space they're given.
function fitHeadline(
  lines: string[],
  tail: string,
  maxWidth: number,
  maxHeight: number,
  ideal: number,
): number {
  const charRatio = 0.54;
  const tailScale = 0.5;
  const lineHeight = 0.9;
  const longest = lines.reduce((acc, l) => Math.max(acc, l.length), 1);
  const byWidth = maxWidth / (longest * charRatio);
  const byTailWidth = maxWidth / (tail.length * charRatio * tailScale);
  const byHeight = maxHeight / (lines.length * lineHeight + tailScale + 0.1);
  return Math.floor(Math.min(ideal, byWidth, byTailWidth, byHeight));
}

// The map comes from our own /api/map, drawn around the venue pin. No
// pin (venue still tbc, or an address nobody could find) means no map
// band, rather than an empty box on the card.
function buildMapSrc(data: PostData): string | null {
  const lat = Number(data.lat);
  const lng = Number(data.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat === 0 && lng === 0) return null;
  return `/api/map?lat=${lat}&lng=${lng}&w=${MAP_WIDTH}&h=${MAP_HEIGHT}`;
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: BRAND_COLORS.ORANGE,
        minWidth: 95,
      }}
    >
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  smallValue = false,
}: {
  label: string;
  value: string;
  smallValue?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
      <Label>{label}</Label>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: smallValue ? 24 : 36,
          color: BRAND_COLORS.BLACK,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          flex: 1,
          wordBreak: smallValue ? "break-all" : "normal",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Footer({ data }: { data: PostData }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 55,
        left: 80,
        right: 80,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 16,
            opacity: 0.6,
            marginBottom: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: BRAND_COLORS.BLACK,
          }}
        >
          part of
        </div>
        <LfgWordmark color={BRAND_COLORS.BLACK} size={36} />
        {data.email && (
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 22,
              marginTop: 20,
              color: BRAND_COLORS.BLACK,
              opacity: 0.8,
            }}
          >
            {data.email}
          </div>
        )}
      </div>
      <SocialIcons
        socials={data.socials}
        color={BRAND_COLORS.BLACK}
        size={32}
        fontSize={20}
      />
    </div>
  );
}
