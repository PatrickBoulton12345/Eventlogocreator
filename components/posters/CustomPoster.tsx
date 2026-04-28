import {
  formatDateForDisplay,
  formatTimeForDisplay,
  getEventTypeLabel,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS, FillMotif } from "@/components/Motif";
import { LfgWordmark } from "@/components/Wordmark";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, fitWordmark, splitWords } from "./PosterFrame";

export function CustomPoster({ data }: { data: PostData }) {
  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);
  const headline = getEventTypeLabel(data);
  const lines = splitWords(headline);
  const fontSize = fitWordmark(lines, 920, 240);

  return (
    <PosterFrame background={BRAND_COLORS.CREAM} color={BRAND_COLORS.BLACK}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <FillMotif
          width={1080}
          barHeight={22}
          colors={[BRAND_COLORS.ORANGE, BRAND_COLORS.BLUE]}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 130,
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
            fontSize: 52,
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
            color: BRAND_COLORS.ORANGE,
            textTransform: "uppercase",
            paddingTop: 14,
          }}
        >
          chapter event
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 290,
          left: 80,
          right: 80,
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: BRAND_COLORS.ORANGE,
          fontSize,
          lineHeight: 0.88,
        }}
      >
        {lines.map((w, i) => (
          <div key={`${w}-${i}`}>{w}</div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 870,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <Row label="when" value={`${date || "date"} • ${time || "time"}`} />
        <Row label="where" value={data.location || "your location"} />
        {data.signupUrl && <Row label="sign up" value={data.signupUrl} smallValue />}
      </div>

      <Footer data={data} />
    </PosterFrame>
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
    <div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: BRAND_COLORS.ORANGE,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: smallValue ? 28 : 46,
          color: BRAND_COLORS.BLACK,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
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
        bottom: 60,
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
            opacity: 0.55,
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
              opacity: 0.75,
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
