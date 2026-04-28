import type { CSSProperties, ReactNode } from "react";

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

export function fitWordmark(
  lines: string[],
  maxWidth: number,
  idealSize: number,
  ratio = 0.54,
): number {
  const longest = lines.reduce((acc, l) => Math.max(acc, l.length), 0);
  if (longest === 0) return idealSize;
  const est = longest * idealSize * ratio;
  if (est <= maxWidth) return idealSize;
  return Math.floor(maxWidth / (longest * ratio));
}
