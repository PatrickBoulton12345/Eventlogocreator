import {
  formatDateForDisplay,
  formatTimeForDisplay,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS } from "@/components/Motif";
import { LfgWordmark } from "@/components/Wordmark";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, fitWordmark, splitWords } from "./PosterFrame";

export function PubMeetingPoster({ data }: { data: PostData }) {
  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);
  const lines = splitWords("pub meeting");
  const wordmarkSize = fitWordmark(lines, 920, 250);

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
            color: BRAND_COLORS.BLACK,
            textTransform: "uppercase",
            paddingTop: 14,
            opacity: 0.7,
          }}
        >
          chapter event
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 280,
          left: 80,
          right: 80,
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: BRAND_COLORS.BLACK,
          fontSize: wordmarkSize,
          lineHeight: 0.88,
        }}
      >
        {lines.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 800,
          left: 80,
          right: 80,
          backgroundColor: BRAND_COLORS.CREAM,
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          gap: 22,
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
    <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
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
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: smallValue ? 26 : 38,
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
