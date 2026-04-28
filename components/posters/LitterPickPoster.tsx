import {
  formatDateForDisplay,
  formatTimeForDisplay,
  type PostData,
} from "@/lib/types";
import { BRAND_COLORS, FillMotif } from "@/components/Motif";
import { LfgWordmark } from "@/components/Wordmark";
import { SocialIcons } from "@/components/SocialIcons";
import { PosterFrame, fitWordmark, splitWords } from "./PosterFrame";

export function LitterPickPoster({ data }: { data: PostData }) {
  const date = formatDateForDisplay(data.date);
  const time = formatTimeForDisplay(data.time);
  const lines = splitWords("litter pick");
  const wordmarkSize = fitWordmark(lines, 920, 250);

  return (
    <PosterFrame background={BRAND_COLORS.CREAM} color={BRAND_COLORS.BLACK}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <FillMotif
          width={1080}
          barHeight={28}
          colors={[BRAND_COLORS.BLUE, BRAND_COLORS.ORANGE, BRAND_COLORS.BLACK]}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 170,
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
            color: BRAND_COLORS.BLUE,
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
          top: 320,
          left: 80,
          right: 80,
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: BRAND_COLORS.BLUE,
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
          top: 820,
          left: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <DetailRow
          label="when"
          accent={BRAND_COLORS.ORANGE}
          textColor={BRAND_COLORS.BLACK}
          big={`${date || "date"} • ${time || "time"}`}
        />
        <DetailRow
          label="where"
          accent={BRAND_COLORS.ORANGE}
          textColor={BRAND_COLORS.BLACK}
          big={data.location || "your location"}
        />
        {data.signupUrl && (
          <DetailRow
            label="sign up"
            accent={BRAND_COLORS.ORANGE}
            textColor={BRAND_COLORS.BLUE}
            big={data.signupUrl}
            small
          />
        )}
      </div>

      <Footer
        data={data}
        textColor={BRAND_COLORS.BLACK}
      />
    </PosterFrame>
  );
}

function DetailRow({
  label,
  accent,
  textColor,
  big,
  small = false,
}: {
  label: string;
  accent: string;
  textColor: string;
  big: string;
  small?: boolean;
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
          color: accent,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 700,
          fontSize: small ? 30 : 50,
          color: textColor,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          wordBreak: small ? "break-all" : "normal",
        }}
      >
        {big}
      </div>
    </div>
  );
}

function Footer({ data, textColor }: { data: PostData; textColor: string }) {
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
              opacity: 0.75,
            }}
          >
            {data.email}
          </div>
        )}
      </div>
      <SocialIcons socials={data.socials} color={textColor} size={32} fontSize={20} />
    </div>
  );
}
