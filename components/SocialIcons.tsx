import type { Socials } from "@/lib/types";

type IconProps = { size: number; color: string };

function InstagramIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.8" />
      <circle cx="17.6" cy="6.4" r="1.1" fill={color} />
    </svg>
  );
}

function FacebookIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14.2 22v-8.6h2.9l.4-3.4h-3.3V7.8c0-1 .3-1.6 1.7-1.6h1.7V3.2c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.8H8.4v3.4h2.8V22h3z"
        fill={color}
      />
    </svg>
  );
}

function TikTokIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.6 2h-3v13.2c0 1.6-1.3 2.9-2.9 2.9-1.6 0-2.9-1.3-2.9-2.9 0-1.6 1.3-2.9 2.9-2.9.3 0 .6 0 .9.1V9.4c-.3 0-.6-.1-.9-.1-3.3 0-5.9 2.7-5.9 5.9C4.8 18.5 7.4 21.2 10.7 21.2c3.3 0 5.9-2.7 5.9-5.9V8.7c1.2.9 2.7 1.4 4.3 1.4V7c-1.2 0-2.3-.4-3.2-1.1-1-.8-1.5-1.9-1.6-3.1l-.5-.8z"
        fill={color}
      />
    </svg>
  );
}

function LinkedInIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="2.5" width="19" height="19" rx="2" stroke={color} strokeWidth="1.8" />
      <rect x="6" y="10" width="2.6" height="8" fill={color} />
      <circle cx="7.3" cy="7" r="1.5" fill={color} />
      <path
        d="M11 10h2.5v1.2c.5-.8 1.5-1.4 2.7-1.4 2 0 2.8 1.3 2.8 3.4V18h-2.6v-4.2c0-1-.4-1.7-1.3-1.7-.9 0-1.5.7-1.5 1.7V18H11v-8z"
        fill={color}
      />
    </svg>
  );
}

function TwitterIcon({ size, color }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"
        fill={color}
      />
    </svg>
  );
}

type Props = {
  socials: Socials;
  color: string;
  size?: number;
  fontSize?: number;
};

function cleanHandle(handle: string): string {
  return handle.replace(/^@+/, "").trim();
}

export function SocialIcons({ socials, color, size = 36, fontSize = 22 }: Props) {
  const items = [
    { key: "instagram" as const, handle: cleanHandle(socials.instagram), Icon: InstagramIcon },
    { key: "facebook" as const, handle: cleanHandle(socials.facebook), Icon: FacebookIcon },
    { key: "tiktok" as const, handle: cleanHandle(socials.tiktok), Icon: TikTokIcon },
    { key: "linkedin" as const, handle: cleanHandle(socials.linkedin), Icon: LinkedInIcon },
    { key: "twitter" as const, handle: cleanHandle(socials.twitter), Icon: TwitterIcon },
  ].filter((x) => x.handle.length > 0);

  if (items.length === 0) return null;

  return (
    <div
      className="font-body"
      style={{ display: "flex", flexDirection: "column", gap: 12, color, fontSize }}
    >
      {items.map(({ key, handle, Icon }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Icon size={size} color={color} />
          <span style={{ fontWeight: 500 }}>@{handle}</span>
        </div>
      ))}
    </div>
  );
}
