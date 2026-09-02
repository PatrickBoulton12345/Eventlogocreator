export type LumaImported = {
  name: string;
  date: string;
  time: string;
  location: string;
  signupUrl: string;
  // Venue coordinates, when the Luma page publishes them (it embeds the
  // same Google Maps pin the event page shows). Used to draw the map.
  lat?: number | null;
  lng?: number | null;
};
