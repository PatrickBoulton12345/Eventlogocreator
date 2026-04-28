type Bar = { color: string; left: number; width: number; height: number };

type Props = {
  variant: "progressing" | "fill";
  width: number;
  bars: Bar[];
};

export function Motif({ width, bars }: Props) {
  const totalHeight = bars.reduce((acc, b) => Math.max(acc, b.height), 0);
  return (
    <div style={{ position: "relative", width, height: totalHeight }}>
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i * (bars[0]?.height ?? 0),
            left: bar.left,
            width: bar.width,
            height: bar.height,
            backgroundColor: bar.color,
          }}
        />
      ))}
    </div>
  );
}

const ORANGE = "#FE5500";
const BLUE = "#79CAC4";
const BLACK = "#000000";
const YELLOW = "#EE9944";

export function ProgressingMotif({
  width,
  barHeight = 28,
  colors,
}: {
  width: number;
  barHeight?: number;
  colors?: string[];
}) {
  const palette = colors ?? [ORANGE, BLUE, ORANGE, BLACK];
  const layout = [
    { left: 0.0, width: 0.5 },
    { left: 0.18, width: 0.55 },
    { left: 0.42, width: 0.45 },
    { left: 0.0, width: 0.18 },
  ];
  const bars = palette.slice(0, layout.length).map((color, i) => ({
    color,
    left: layout[i].left * width,
    width: layout[i].width * width,
    height: barHeight,
  }));
  return (
    <div style={{ position: "relative", width, height: barHeight * bars.length }}>
      {bars.map((bar, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: i * barHeight,
            left: bar.left,
            width: bar.width,
            height: barHeight,
            backgroundColor: bar.color,
          }}
        />
      ))}
    </div>
  );
}

export function FillMotif({
  width,
  barHeight = 28,
  colors = [ORANGE, BLUE, BLACK],
}: {
  width: number;
  barHeight?: number;
  colors?: string[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width }}>
      {colors.map((c, i) => (
        <div key={i} style={{ width: "100%", height: barHeight, backgroundColor: c }} />
      ))}
    </div>
  );
}

export const BRAND_COLORS = { ORANGE, BLUE, BLACK, YELLOW, CREAM: "#EBE3D0" };
