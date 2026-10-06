// Finds free-to-use photos of a chapter's city for the card background.
// Searches Openverse (Flickr + Wikimedia photos under licences that allow
// commercial use), falling back to Wikimedia Commons directly. Neither
// needs an account or API key. Every photo carries its credit, which the
// card prints in small type as the licences require.

import { findChapterName } from "@/lib/chapters";
import type { PostData } from "@/lib/types";

export type CityPhoto = {
  // The full-size picture, passed through our own /api/photo so the
  // download button and the headless renderer can both draw it.
  url: string;
  // A small preview for the picker in the form.
  thumb: string;
  credit: string;
};

const UA =
  "LFGEventCreator/1.0 (+https://eventlogocreator.vercel.app; patrick@lookingforgrowth.uk)";

// Hosts /api/photo is allowed to fetch from.
export const PHOTO_HOSTS = [
  "live.staticflickr.com",
  "farm1.staticflickr.com",
  "farm2.staticflickr.com",
  "farm3.staticflickr.com",
  "farm4.staticflickr.com",
  "farm5.staticflickr.com",
  "farm6.staticflickr.com",
  "farm7.staticflickr.com",
  "farm8.staticflickr.com",
  "farm9.staticflickr.com",
  "upload.wikimedia.org",
  "api.openverse.org",
];

// What to search for each chapter: a few landmarks that say "this city"
// at a glance, and the words a photo's title must mention, so a search
// for "Putney" can't come back with Putney, Vermont.
type PhotoSearch = { place: string; queries: string[]; mentions: RegExp };

const CHAPTER_SEARCHES: Record<string, PhotoSearch> = {
  "Hammersmith & Fulham": {
    place: "Hammersmith & Fulham",
    queries: ["Hammersmith Bridge", "Fulham Palace", "Hammersmith Broadway", "Fulham Road London"],
    mentions: /hammersmith|fulham/i,
  },
  "Reading & Berkshire": {
    place: "Reading",
    queries: ["Reading Berkshire town centre", "Forbury Gardens Reading", "Reading Abbey ruins", "Reading railway station Berkshire"],
    mentions: /berkshire|forbury|reading (abbey|station|town|minster|gaol)|, reading\b/i,
  },
  "South West England": {
    place: "Bristol",
    queries: ["Bristol skyline", "Clifton Suspension Bridge", "Bristol Harbourside", "Bristol city centre"],
    mentions: /bristol|clifton/i,
  },
  "South Wales": {
    place: "Cardiff",
    queries: ["Cardiff Bay", "Cardiff Castle", "Cardiff city centre", "Principality Stadium Cardiff"],
    mentions: /cardiff|principality/i,
  },
  "West Midlands": {
    place: "Birmingham",
    queries: ["Birmingham skyline", "Birmingham Bullring", "Library of Birmingham", "Birmingham canal Brindleyplace"],
    mentions: /birmingham|bullring|brindleyplace/i,
  },
  "Leicester / East Midlands": {
    place: "Leicester",
    queries: ["Leicester city centre", "Leicester Clock Tower", "Leicester Cathedral", "Nottingham Old Market Square"],
    mentions: /leicester|nottingham/i,
  },
  "Milton Keynes": {
    place: "Milton Keynes",
    queries: ["Milton Keynes centre", "Campbell Park Milton Keynes", "Milton Keynes skyline", "Milton Keynes"],
    mentions: /milton keynes/i,
  },
  Kent: {
    place: "Kent",
    queries: ["Canterbury Westgate", "Canterbury High Street Kent", "Rochester Castle Kent", "White Cliffs of Dover"],
    mentions: /canterbury|rochester|dover|kent|maidstone/i,
  },
  Barnet: {
    place: "Barnet",
    queries: ["Chipping Barnet High Street", "Barnet London", "High Barnet", "Barnet church"],
    mentions: /barnet/i,
  },
  Brighton: {
    place: "Brighton",
    queries: ["Brighton seafront", "Brighton Palace Pier", "Royal Pavilion Brighton", "Brighton i360"],
    mentions: /brighton/i,
  },
  Cambridge: {
    place: "Cambridge",
    queries: ["King's College Chapel Cambridge", "Cambridge punting River Cam", "Bridge of Sighs Cambridge", "Cambridge Market Square"],
    mentions: /cambridge|river cam/i,
  },
  Ealing: {
    place: "Ealing",
    queries: ["Ealing Broadway", "Ealing Town Hall", "Ealing Green", "Ealing London"],
    mentions: /ealing/i,
  },
  Edinburgh: {
    place: "Edinburgh",
    queries: ["Edinburgh skyline", "Edinburgh Castle", "Calton Hill Edinburgh", "Victoria Street Edinburgh"],
    mentions: /edinburgh|calton/i,
  },
  Lambeth: {
    place: "Lambeth",
    queries: ["Lambeth Bridge", "Lambeth Palace", "South Bank London", "Brixton London"],
    mentions: /lambeth|south bank|brixton|vauxhall|london eye/i,
  },
  Leeds: {
    place: "Leeds",
    queries: ["Leeds city centre", "Leeds Town Hall", "Leeds Corn Exchange", "Leeds Dock"],
    mentions: /leeds/i,
  },
  Liverpool: {
    place: "Liverpool",
    queries: ["Liverpool waterfront", "Royal Liver Building", "Albert Dock Liverpool", "Liverpool skyline"],
    mentions: /liverpool|liver building|albert dock/i,
  },
  Manchester: {
    place: "Manchester",
    queries: ["Manchester skyline", "Manchester Town Hall", "Beetham Tower Manchester", "Castlefield Manchester"],
    mentions: /manchester|beetham|castlefield/i,
  },
  Newcastle: {
    place: "Newcastle",
    queries: ["Newcastle Quayside", "Tyne Bridge", "Gateshead Millennium Bridge", "Grey Street Newcastle"],
    mentions: /newcastle|tyne|gateshead/i,
  },
  Oxford: {
    place: "Oxford",
    queries: ["Radcliffe Camera Oxford", "Oxford skyline", "Oxford High Street", "Bridge of Sighs Oxford"],
    mentions: /oxford|radcliffe/i,
  },
  Putney: {
    place: "Putney",
    queries: ["Putney Bridge London", "Putney Embankment", "Putney High Street", "Putney London"],
    mentions: /putney/i,
  },
  Sheffield: {
    place: "Sheffield",
    queries: ["Sheffield city centre", "Sheffield Winter Garden", "Sheffield Peace Gardens", "Sheffield skyline"],
    mentions: /sheffield/i,
  },
  Southwark: {
    place: "Southwark",
    queries: ["The Shard London", "Borough Market", "Southwark Cathedral", "Tower Bridge"],
    mentions: /southwark|shard|borough market|tower bridge|bermondsey/i,
  },
  Swindon: {
    place: "Swindon",
    queries: ["Swindon town centre", "Swindon", "Swindon railway village", "Swindon Wiltshire"],
    mentions: /swindon/i,
  },
  Westminster: {
    place: "Westminster",
    queries: ["Palace of Westminster", "Westminster Bridge", "Big Ben London", "Trafalgar Square"],
    mentions: /westminster|big ben|elizabeth tower|trafalgar|whitehall/i,
  },
};

// Places that share a name with ours.
const ELSEWHERE =
  /new zealand|vermont|new hampshire|connecticut|australia|new south wales|massachusetts|ohio|mississippi|canada|united states|\busa\b|jamaica|tasmania/i;
// Close-ups and documents that don't work as a city backdrop.
const NOT_A_VIEW =
  /plaque|\bmap\b|memorial|inscription|interior|stained glass|diagram|logo|\bsign\b|painting|engraving/i;

function photoSearch(chapter: string): PhotoSearch | null {
  const known = findChapterName(chapter);
  if (known && CHAPTER_SEARCHES[known]) return CHAPTER_SEARCHES[known];
  const place = chapter.replace(/\blfg\b/gi, "").replace(/\s+/g, " ").trim();
  if (!place) return null;
  const escaped = place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    place,
    queries: [`${place} skyline`, `${place} city centre`, `${place} town centre`, place],
    mentions: new RegExp(escaped, "i"),
  };
}

// The place a chapter's photos show, e.g. "LFG South Wales" → "Cardiff".
export function photoPlace(chapter: string): string {
  return photoSearch(chapter)?.place ?? "";
}

const cache = new Map<string, CityPhoto[]>();

export async function findCityPhotos(chapter: string, limit = 8): Promise<CityPhoto[]> {
  const search = photoSearch(chapter);
  if (!search) return [];
  const key = search.queries.join("|");
  const cached = cache.get(key);
  if (cached) return cached.slice(0, limit);

  // `about` is the photo's description and categories, where a title like
  // "Manchester Skyline Night" turns out to be Manchester, New Hampshire.
  const fits = (title: string, about = "") =>
    search.mentions.test(title) &&
    !ELSEWHERE.test(`${title} ${about}`) &&
    !NOT_A_VIEW.test(title);

  // Wikimedia Commons titles its photos well, so it leads; Openverse
  // (mostly Flickr) only fills in if Commons comes up short.
  let lists = await Promise.all(
    search.queries.map((q) => searchCommons(q, fits).catch(() => [])),
  );
  if (lists.reduce((n, l) => n + l.length, 0) < limit) {
    lists = lists.concat(
      await Promise.all(search.queries.map((q) => searchOpenverse(q, fits).catch(() => []))),
    );
  }

  // Take turns between the searches, so the options are a mix of
  // landmarks rather than eight shots of the first one.
  const seen = new Set<string>();
  const perCredit = new Map<string, number>();
  const photos: CityPhoto[] = [];
  for (let i = 0; photos.length < limit && lists.some((l) => i < l.length); i++) {
    for (const list of lists) {
      const p = list[i];
      if (!p || seen.has(p.url) || photos.length >= limit) continue;
      // At most two from one photographer.
      const who = p.credit.split(" / ")[0];
      if ((perCredit.get(who) ?? 0) >= 2) continue;
      perCredit.set(who, (perCredit.get(who) ?? 0) + 1);
      seen.add(p.url);
      photos.push(p);
    }
  }

  if (photos.length > 0) cache.set(key, photos);
  return photos;
}

export function proxied(src: string): string {
  return `/api/photo?src=${encodeURIComponent(src)}`;
}

type OpenverseResult = {
  url: string;
  thumbnail: string;
  width: number | null;
  height: number | null;
  creator: string | null;
  license: string;
  license_version: string | null;
  source: string;
  title: string | null;
  tags?: { name: string }[];
};

async function searchOpenverse(
  q: string,
  fits: (title: string, about?: string) => boolean,
): Promise<CityPhoto[]> {
  const url = new URL("https://api.openverse.org/v1/images/");
  url.searchParams.set("q", q);
  // Must allow commercial use and changes: words over a photo count as
  // a change, so "no derivatives" licences are out.
  url.searchParams.set("license_type", "commercial,modification");
  url.searchParams.set("source", "flickr,wikimedia");
  url.searchParams.set("category", "photograph");
  url.searchParams.set("page_size", "20");
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { results?: OpenverseResult[] };

  return (json.results ?? [])
    // Too small and the photo goes soft once it fills a 1080-wide card.
    .filter((r) => usableSize(r.width ?? 0, r.height ?? 0))
    .filter((r) => isAllowedHost(r.url) && fits(r.title ?? "", (r.tags ?? []).map((t) => t.name).join(" ")))
    .map((r) => ({
      url: proxied(sizedWikimedia(r.url, r.width ?? 0)),
      thumb: r.thumbnail,
      credit: formatCredit(
        r.creator,
        r.source === "wikimedia" ? "Wikimedia Commons" : "Flickr",
        r.license,
        r.license_version,
      ),
    }));
}

type CommonsPage = {
  title: string;
  index?: number;
  imageinfo?: {
    url: string;
    thumburl?: string;
    width: number;
    height: number;
    extmetadata?: Record<string, { value: string } | undefined>;
  }[];
};

async function searchCommons(
  q: string,
  fits: (title: string, about?: string) => boolean,
): Promise<CityPhoto[]> {
  const url = new URL("https://commons.wikimedia.org/w/api.php");
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrnamespace", "6");
  url.searchParams.set("gsrsearch", `${q} filetype:bitmap`);
  url.searchParams.set("gsrlimit", "10");
  url.searchParams.set("prop", "imageinfo");
  url.searchParams.set("iiprop", "url|size|extmetadata");
  url.searchParams.set("iiurlwidth", "330");
  const res = await fetch(url, {
    headers: { "User-Agent": UA },
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as { query?: { pages?: Record<string, CommonsPage> } };

  // Commons returns pages keyed by id; `index` keeps its best-first order.
  const pages = Object.values(json.query?.pages ?? {}).sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );
  const photos: CityPhoto[] = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info || !usableSize(info.width, info.height)) continue;
    const meta = info.extmetadata ?? {};
    const about = stripTags(`${meta.ImageDescription?.value ?? ""} ${meta.Categories?.value ?? ""}`);
    if (!fits(page.title, about)) continue;
    const licence = stripTags(meta.LicenseShortName?.value ?? "");
    // Only licences that allow us to use it on a post.
    if (!/^(cc0|cc[ -]by|public domain|pd)/i.test(licence) || /\b(nc|nd)\b/i.test(licence)) continue;
    photos.push({
      url: proxied(sizedWikimedia(info.url, info.width)),
      thumb: info.thumburl ?? info.url,
      credit: `Photo: ${stripTags(meta.Artist?.value ?? "Unknown")} / Wikimedia Commons, ${licence}`,
    });
  }
  return photos;
}

// Big enough to stay sharp across a 1080-wide card, and not so wide a
// panorama that the portrait card only shows a thin slice of it.
function usableSize(width: number, height: number): boolean {
  if (Math.max(width, height) < 1000 || height === 0) return false;
  return width / height <= 1.8;
}

// Wikimedia originals can be 6000+ pixels wide; ask for a 1920-wide copy
// instead, which is plenty for the card and far quicker to load.
function sizedWikimedia(rawSrc: string, width: number): string {
  // Commons tacks tracking parameters onto its links; drop them.
  const src = rawSrc.replace(/\?utm_[^/]*$/, "");
  const m = src.match(/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/(\w\/\w\w)\/([^/]+)$/);
  if (!m || width <= 1920) return src;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/1920px-${m[2]}`;
}

export function isAllowedHost(src: string): boolean {
  try {
    const u = new URL(src);
    return u.protocol === "https:" && PHOTO_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}

function formatCredit(
  creator: string | null,
  where: string,
  license: string,
  version: string | null,
): string {
  const lic =
    license === "cc0" || license === "pdm"
      ? "public domain"
      : `CC ${license.toUpperCase()}${version ? ` ${version}` : ""}`;
  return `Photo: ${(creator || "Unknown").trim()} / ${where}, ${lic}`;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

// For cards made without the form (/api/card, the weekly ZIP): use the
// chapter's photo number `pick` (1 = first), or the first if that's out
// of range. No photos found leaves the card on its plain dark background.
export async function ensureCityPhoto(data: PostData, pick = 1): Promise<PostData> {
  if (data.photoUrl) return data;
  const photos = await findCityPhotos(data.chapter).catch(() => []);
  const photo = photos[pick - 1] ?? photos[0];
  if (!photo) return data;
  return { ...data, photoUrl: photo.url, photoCredit: photo.credit };
}
