# LFG Event Post Creator

Make on-brand Instagram posts (1080 × 1350 px) for LFG chapter events. Pick an event style, fill in the details, download a JPG.

## The card

Every event type uses the same layout, matching the "LFG wins" carousel slides: a photo of the chapter's city fills the card and fades into a dark tint at the bottom, with the chapter name in a coloured tag, a big lowercase headline ("manchester at the pub."), the date and venue, the sign-up link, the lookingforgrowth wordmark and the four-colour strip along the bottom.

The event type sets the headline words and the colour:

- **Pub Social**: "<place> at the pub.", orange
- **Hackathon**: "<place> hackathon.", yellow
- **Litter Pick**: "<place> litter pick.", green
- **Custom**: "<place> <your words>.", teal

Optional extras: sign-up link, contact email, and Instagram / Facebook / TikTok / LinkedIn / X handles.

## City photos

Once a chapter name is typed, the form shows eight photos of that city to choose from; the first is picked automatically. Organisers can click another, upload their own, or go without.

- Photos come from Wikimedia Commons, with Openverse (mostly Flickr) as a backup. Neither needs an account or API key. Only licences that allow commercial use and changes are used, and the card prints the photographer's credit in small type, as those licences require.
- Each known chapter has its own list of landmark searches in `lib/photos.ts` (e.g. Westminster searches the Palace of Westminster, Big Ben and Trafalgar Square). A photo's title must mention the place, which stops a search for "Putney" finding Putney, Vermont. Edit those lists to change which photos a chapter is offered.
- Photos load through `app/api/photo/route.ts` so the download button and `/api/card` can both draw them.
- `/api/card` uses the first photo; add `&photo=3` to use the third instead. `/api/photos?chapter=LFG Leeds` lists the options.

## Import from Luma

Paste a Luma event URL at the top of the form and hit **Import** to auto-fill the location, date, time, and sign-up link. If any of those fields are already filled, the app shows a confirmation modal listing exactly what will be overwritten before applying. The chapter is read from the event name (Luma events are usually called "LFG <chapter> …"), and that chapter's Instagram and X handles fill any empty social fields. The event type is never changed — that stays the user's choice.

The import is powered by a small Next.js API route at `app/api/luma/route.ts` that fetches the public Luma page server-side (avoids CORS), parses the embedded JSON-LD `Event` schema, and falls back to OpenGraph meta tags if needed.

## Venue map (not currently on the card)

The old pub social card ended with a map of the venue. The city-photo layout leaves it off, but the pieces are still here if it's wanted back: `app/api/map/route.ts` draws the map from OpenStreetMap tiles (no API key), and venue pins still come from Luma or from looking up the typed address.

## Run it locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

To preview all four event types side-by-side with sample data, visit <http://localhost:3000/preview>.

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
