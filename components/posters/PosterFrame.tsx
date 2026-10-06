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
