type Props = {
  color?: string;
  size?: number;
  showDomain?: boolean;
};

export function LfgWordmark({ color = "#000", size = 24, showDomain = true }: Props) {
  return (
    <span
      className="font-headline"
      style={{
        color,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1,
      }}
    >
      lookingforgrowth
      {showDomain && (
        <span
          style={{
            fontSize: size * 0.45,
            verticalAlign: "baseline",
            marginLeft: size * 0.05,
            opacity: 0.85,
          }}
        >
          .uk
        </span>
      )}
    </span>
  );
}
