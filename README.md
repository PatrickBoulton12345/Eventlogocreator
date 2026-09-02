# LFG Event Post Creator

Make on-brand Instagram posts (1080 × 1350 px) for LFG chapter events. Pick an event style, fill in the details, download a JPG.

## Event styles

- **Hackathon** — black background, big orange wordmark, "progressing" bar motif. Energetic, builder feel.
- **Litter Pick** — cream background, blue stacked wordmark, fill bars across the top. Civic, clean.
- **Pub Social** — orange background, headline reads "<chapter> at the pub", cream details box with the venue as the biggest line, and a map of the venue along the bottom. Warm, social.
- **Custom** — slimmed-down cream layout for any event type the chapter wants to run. Type in your own headline (1–3 words).

Every post includes the chapter name, the event type, the location, the date, and the time. Optional: sign-up link, contact email, and Instagram / Facebook / TikTok / LinkedIn / X handles.

## Import from Luma

Paste a Luma event URL at the top of the form and hit **Import** to auto-fill the location, date, time, and sign-up link. If any of those fields are already filled, the app shows a confirmation modal listing exactly what will be overwritten before applying. The chapter name, socials, and event type are never overwritten — those stay the user's choice.

The import is powered by a small Next.js API route at `app/api/luma/route.ts` that fetches the public Luma page server-side (avoids CORS), parses the embedded JSON-LD `Event` schema, and falls back to OpenGraph meta tags if needed.

## The map on the pub social card

The pub social card ends with a map of the venue, pinned in LFG orange.

- A Luma link already carries the venue's map pin, so cards made from one
  need nothing extra.
- An address typed into the form is looked up on the map when you leave
  the Location field.
- Either way the picture is drawn by `app/api/map/route.ts`, which builds
  it from OpenStreetMap tiles. No account, API key or billing needed. If
  the venue can't be found (or is still "tbc") the card simply leaves the
  map off rather than showing an empty box.
- Using Google's own map styling instead would mean a Google Maps API key
  with billing switched on; only the tile fetching in that file changes.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

To preview all four styles side-by-side with sample data, visit <http://localhost:3000/preview>.

## Brand assets

- Octarine (headlines) — local files in `public/fonts/`
- DM Sans (body) — loaded from Google Fonts
- Brand colours wired into `app/globals.css` under `@theme` (use as `lfg-black`, `lfg-orange`, `lfg-yellow`, `lfg-blue`, `lfg-cream`)

The brand bible PDF is included in the repo root for reference.

## Tech

- Next.js 16 + React 19 + TypeScript
- Tailwind 4 (CSS-first config)
- `html-to-image` for JPG export at exact 1080 × 1350 px

## Adding a new event style

1. Create `components/posters/MyStylePoster.tsx` — copy one of the existing posters as a starting point.
2. Add it to the `EventType` union and `EVENT_TYPES` list in `lib/types.ts`.
3. Wire it into the switch in `components/Poster.tsx`.
