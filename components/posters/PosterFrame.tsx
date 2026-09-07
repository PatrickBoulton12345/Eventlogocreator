import type { CSSProperties, ReactNode } from "react";
import { fitToWidth } from "@/lib/text-width";

type Props = {
  background: string;
  color: string;
  children: ReactNode;
  style?: CSSProperties;
};

export const POSTER_WIDTH = 1080;
export const POSTER_HEIGHT = 1350;

export function PosterFrame({ background, color, children, style }: Props) {
  return (
    <div
      style={{
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        position: "relative",
        overflow: "hidden",
        backgroundColor: background,
        color,
        fontFamily: "var(--font-body)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function splitWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// The biggest size at which every line still fits the width, measured
// from the real headline font (see lib/text-width.ts) so wide words
// can't run off the edge of the card.
export function fitWordmark(
  lines: string[],
  maxWidth: number,
  idealSize: number,
  letterSpacingEm = -0.04,
): number {
  if (lines.length === 0) return idealSize;
  return lines.reduce(
    (size, line) =>
      Math.min(size, fitToWidth(line, maxWidth, idealSize, letterSpacingEm)),
    idealSize,
  );
}
