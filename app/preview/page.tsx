import { Poster } from "@/components/Poster";
import type { EventType, PostData } from "@/lib/types";
import { ensureCityPhoto } from "@/lib/photos";

export const dynamic = "force-dynamic";

const sample = (type: EventType, customLabel = ""): PostData => ({
  eventType: type,
  customEventLabel: customLabel,
  chapter: "LFG Manchester",
  location: "The Castle, Manchester M4 1ND",
  lat: 53.4841,
  lng: -2.2354,
  date: "2026-05-15",
  time: "19:00",
  signupUrl: "https://lookingforgrowth.uk/manchester/event",
  email: "manchester@lookingforgrowth.uk",
  socials: {
    instagram: "lfgmanchester",
    facebook: "lfgmanchester",
    tiktok: "lfgmanchester",
    linkedin: "lfg-manchester",
    twitter: "lfgmanchester",
  },
});

export default async function Preview() {
  const raw: { label: string; data: PostData }[] = [
    { label: "Hackathon", data: sample("hackathon") },
    { label: "Litter Pick", data: sample("litter-pick") },
    { label: "Pub Social", data: sample("pub-social") },
    { label: "Custom (growth summit)", data: sample("custom", "growth summit") },
  ];
  // Each sample uses a different Manchester photo, to show the range.
  const samples = await Promise.all(
    raw.map(async (s, i) => ({ ...s, data: await ensureCityPhoto(s.data, i + 1) })),
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, padding: 32 }}>
      {samples.map((s) => (
        <div key={s.label}>
          <h2
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 32,
              marginBottom: 12,
            }}
          >
            {s.label}
          </h2>
          <div
            style={{
              transform: "scale(0.5)",
              transformOrigin: "top left",
              width: 1080,
              height: 1350,
            }}
          >
            <Poster data={s.data} />
          </div>
          <div style={{ height: 700 }} />
        </div>
      ))}
    </div>
  );
}
