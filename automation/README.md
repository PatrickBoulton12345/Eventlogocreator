# Event Card Bot

Automation that watches the "Upcoming Chapter Events" Google Doc and, for
every Luma link without a card yet, creates the card image via
`https://eventlogocreator.vercel.app/api/card?luma=<link>`, saves it to the
"Event Cards" folder in Google Drive, and pastes the share link into the doc.

## Setup (one time, ~2 minutes)

1. Open the Google Doc with the events list.
2. Menu: **Extensions → Apps Script**. A code editor opens in a new tab.
3. Delete anything in the editor, then paste in the whole of
   `google-apps-script.gs` and click the 💾 save icon.
4. In the dropdown next to the ▶ Run button, choose **setup**, then press
   **Run**. Google will ask you to authorise the script — approve it.
   (You may see a "Google hasn't verified this app" warning because it's
   your own private script — click Advanced → Go to project.)
5. Done. It now checks the doc every 15 minutes. There's also an
   **Event Cards → Generate cards now** menu inside the doc after reopening it.

## How cards are filled in

Everything comes from the Luma page: event name, date, time, venue and
sign-up link. The event name decides the design — "…Social" becomes the
orange pub-social card, "…Litter Pick" and "…Hackathon" get their designs,
and anything else (e.g. "LFG Summer Party") becomes a custom card with the
name as the headline. Chapter social handles are filled in automatically
from the list in `lib/chapters.ts`.

Manual overrides if a card comes out wrong:
`/api/card?luma=<link>&chapter=LFG Leeds&type=pub-social`
(types: `pub-social`, `litter-pick`, `hackathon`, `custom`)

Pub social cards also draw a map of the venue. The pin comes from the Luma
page; override it with `&lat=53.4808&lng=-2.2426` if it lands in the wrong
place, or `&location=` to change the address (which is then looked up on
the map afresh).
