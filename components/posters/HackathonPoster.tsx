import {
  formatDateForDisplay,
  formatTimeForDisplay,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS, ProgressingMotif } from "@/components/Motif";
import { LfgWordmark } from "@/components/Wordmark";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, fitWordmark, splitWords } from "./PosterFrame";

export function HackathonPoster({ data }: { data: PostData }) {
  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);
  const lines = splitWords("hackathon");
  const wordmarkSize = fitWordmark(lines, 920, 230);

  return (
    <PosterFrame background={BRAND_COLORS.BLACK} color={BRAND_COLORS.CREAM}>
      <div
        style={{
          position: "absolute",
          top: 70,
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
            color: BRAND_COLORS.CREAM,
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
          top: 220,
          left: 80,
          right: 80,
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: BRAND_COLORS.ORANGE,
          fontSize: wordmarkSize,
          lineHeight: 0.9,
        }}
      >
        {lines.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div style={{ position: "absolute", top: 540, left: 80 }}>
        <ProgressingMotif
          width={920}
          barHeight={24}
          colors={[BRAND_COLORS.ORANGE, BRAND_COLORS.BLUE, BRAND_COLORS.YELLOW, BRAND_COLORS.CREAM]}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 720,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <Eyebrow color={BRAND_COLORS.ORANGE}>when</Eyebrow>
          <div
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 78,
              color: BRAND_COLORS.CREAM,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {date || "date"}
          </div>
          <div
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 78,
              color: BRAND_COLORS.BLUE,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            {time || "time"}
          </div>
        </div>
        <div style={{ marginTop: 28 }}>
          <Eyebrow color={BRAND_COLORS.ORANGE}>where</Eyebrow>
          <div
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 44,
              color: BRAND_COLORS.CREAM,
              letterSpacing: "-0.02em",
              marginTop: 8,
              lineHeight: 1.05,
            }}
          >
            {data.location || "your location"}
          </div>
        </div>
        {data.signupUrl && (
          <div style={{ marginTop: 18 }}>
            <Eyebrow color={BRAND_COLORS.ORANGE}>sign up</Eyebrow>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 28,
                color: BRAND_COLORS.ORANGE,
                fontWeight: 500,
                marginTop: 6,
                wordBreak: "break-all",
              }}
            >
              {data.signupUrl}
            </div>
          </div>
        )}
      </div>

      <Footer
        data={data}
        textColor={BRAND_COLORS.CREAM}
        accent={BRAND_COLORS.ORANGE}
      />
    </PosterFrame>
  );
}

function Eyebrow({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "var(--font-body)",
        fontSize: 18,
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  );
}

function Footer({
  data,
  textColor,
  accent,
}: {
  data: PostData;
  textColor: string;
  accent: string;
}) {
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
            color: textColor,
          }}
        >
          part of
        </div>
        <LfgWordmark color={textColor} size={36} />
        {data.email && (
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 22,
              marginTop: 20,
              color: textColor,
              opacity: 0.85,
            }}
          >
            {data.email}
          </div>
        )}
      </div>
      <SocialIcons
        socials={data.socials}
        color={textColor}
        size={32}
        fontSize={20}
      />
    </div>
  );
}
